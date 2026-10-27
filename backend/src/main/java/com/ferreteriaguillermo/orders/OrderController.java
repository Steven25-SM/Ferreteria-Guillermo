package com.ferreteriaguillermo.orders;
import com.ferreteriaguillermo.auth.*;
import com.ferreteriaguillermo.inventory.*;
import com.ferreteriaguillermo.products.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.util.*;
import org.springframework.security.core.Authentication;
@RestController public class OrderController {
    private final OrderRepository orders;
    private final OrderItemRepository items;
    private final SaleRepository sales;
    private final SaleItemRepository saleItems;
    private final ProductRepository products;
    private final InventoryRepository inventory;
    private final StockService stock;
    private final UserRepository users;
    public OrderController(OrderRepository o,OrderItemRepository i,SaleRepository s,SaleItemRepository si,ProductRepository p,InventoryRepository inv,StockService st,UserRepository u) {
        orders=o;
        items=i;
        sales=s;
        saleItems=si;
        products=p;
        inventory=inv;
        stock=st;
        users=u;
    }
    public record CartItem(Long productId,int quantity) {
    }
    public record CreateOrder(List<CartItem>items,String paymentMethod) {
    }
    public record SaleInput(List<CartItem> items,String paymentMethod) {
    }
    public record OrderView(Long id,String customerEmail,String status,String paymentMethod,String paymentStatus,BigDecimal total) {
    }
    private User actor(Authentication auth) {
        return users.findByEmailIgnoreCase(auth.getName()).orElseThrow();
    }
    private void payment(String method) {
        if(!Set.of("CASH","YAPE","PLIN").contains(method))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Medio de pago no válido");
    }
    @PostMapping("/api/orders")@Transactional public Map<String,Object> order(@RequestBody CreateOrder input,Authentication auth) {
        payment(input.paymentMethod());
        if(input.items()==null||input.items().isEmpty()||input.items().size()>100)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Carrito vacío o demasiado grande");
        User user=actor(auth);
        Map<Long,Integer> aggregated=new TreeMap<>();
        for(CartItem item:input.items()) {
            if(item.productId()==null||item.quantity()<=0||item.quantity()>999)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Cantidad inválida");
            aggregated.merge(item.productId(),item.quantity(),Integer::sum);
        }
        BigDecimal total=BigDecimal.ZERO;
        List<OrderItem> lines=new ArrayList<>();
        for(var entry:aggregated.entrySet()) {
            Product p=products.findById(entry.getKey()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Producto no encontrado"));
            if(!p.active)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Producto no disponible");
            stock.move(p.id,"OUT",entry.getValue(),user.id,"Reserva por pedido online");
            OrderItem line=new OrderItem();
            line.productId=p.id;
            line.quantity=entry.getValue();
            line.unitPrice=p.price;
            lines.add(line);
            total=total.add(p.price.multiply(BigDecimal.valueOf(entry.getValue())));
        }
        StoreOrder o=new StoreOrder();
        o.userId=user.id;
        o.total=total;
        o.paymentMethod=input.paymentMethod();
        orders.saveAndFlush(o);
        for(OrderItem i:lines) {
            i.orderId=o.id;
            items.save(i);
        }
        return Map.of("id",o.id,"total",o.total,"status",o.status);
    }
    public record CustomerLine(Long productId,String productName,int quantity,BigDecimal unitPrice) {}
    public record CustomerOrder(Long id,String status,String paymentMethod,String paymentStatus,BigDecimal total,java.time.OffsetDateTime createdAt,List<CustomerLine> products) {}
    @GetMapping("/api/orders/mine") public List<CustomerOrder> mine(Authentication auth) {
        Long userId=actor(auth).id;
        return orders.findAll().stream().filter(o -> userId.equals(o.userId))
            .sorted(Comparator.comparing((StoreOrder o)->o.id).reversed())
            .map(o -> new CustomerOrder(o.id,o.status,o.paymentMethod,o.paymentStatus,o.total,o.createdAt,
                items.findByOrderId(o.id).stream().map(i -> new CustomerLine(i.productId,
                    products.findById(i.productId).map(product -> product.name).orElse("Producto no disponible"),
                    i.quantity,i.unitPrice)).toList())).toList();
    }
    @GetMapping("/api/admin/orders")public List<OrderView> list() {
        return orders.findAll().stream().sorted(Comparator.comparing((StoreOrder o)->o.id).reversed()).map(o->new OrderView(o.id,users.findById(o.userId).map(u->u.email).orElse("—"),o.status,o.paymentMethod,o.paymentStatus,o.total)).toList();
    }
    @PostMapping("/api/admin/orders/{id}/complete")@Transactional public Map<String,String> complete(@PathVariable Long id) {
        StoreOrder o=orders.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
        if(!o.status.equals("PENDING"))throw new ResponseStatusException(HttpStatus.CONFLICT,"Pedido ya procesado");
        o.status="COMPLETED";
        o.paymentStatus="CONFIRMED";
        orders.save(o);
        return Map.of("message","Pedido completado");
    }
    @PostMapping("/api/admin/orders/{id}/cancel")@Transactional public Map<String,String> cancel(@PathVariable Long id,Authentication auth) {
        StoreOrder o=orders.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
        if(!o.status.equals("PENDING"))throw new ResponseStatusException(HttpStatus.CONFLICT,"Pedido ya procesado");
        User u=actor(auth);
        for(OrderItem item:items.findByOrderId(id))stock.move(item.productId,"IN",item.quantity,u.id,"Liberación por cancelación de pedido");
        o.status="CANCELLED";
        orders.save(o);
        return Map.of("message","Pedido cancelado");
    }
    @PostMapping("/api/admin/sales") @Transactional public Map<String,Object> sale(@RequestBody SaleInput input,Authentication auth) {
        if(input==null)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Venta inválida");
        payment(input.paymentMethod());
        if(input.items()==null||input.items().isEmpty()||input.items().size()>100)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Agrega al menos un producto");
        Map<Long,Integer> aggregated=new TreeMap<>();
        for(CartItem item:input.items()) {
            if(item==null||item.productId()==null||item.quantity()<=0||item.quantity()>999)
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Producto o cantidad inválidos");
            aggregated.merge(item.productId(),item.quantity(),Integer::sum);
            if(aggregated.get(item.productId())>999)
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Cantidad excesiva");
        }
        // Precio y artículos fijados en el servidor; nunca confiar en totales del navegador.
        BigDecimal total=BigDecimal.ZERO;
        List<SaleItem> lines=new ArrayList<>();
        for(var entry:aggregated.entrySet()) {
            Product product=products.findById(entry.getKey()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Producto no encontrado"));
            if(!product.active)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Producto inactivo");
            SaleItem line=new SaleItem();
            line.productId=product.id;
            line.quantity=entry.getValue();
            line.unitPrice=product.price;
            lines.add(line);
            total=total.add(product.price.multiply(BigDecimal.valueOf(entry.getValue())));
        }
        User user=actor(auth);
        // Todos los movimientos y la venta son una única transacción: sin ventas parciales.
        for(SaleItem line:lines)stock.move(line.productId,"OUT",line.quantity,user.id,"Venta presencial");
        Sale sale=new Sale();
        sale.actorId=user.id;
        sale.total=total;
        sale.paymentMethod=input.paymentMethod();
        sales.saveAndFlush(sale);
        for(SaleItem line:lines) { line.saleId=sale.id; saleItems.save(line); }
        return Map.of("id",sale.id,"total",sale.total,"items",lines.size());
    }
}
