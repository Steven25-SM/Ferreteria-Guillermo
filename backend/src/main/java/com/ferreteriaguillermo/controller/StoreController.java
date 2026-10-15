package com.ferreteriaguillermo.controller;
import com.ferreteriaguillermo.model.*;
import com.ferreteriaguillermo.repository.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;
import java.math.*;
import java.time.LocalDateTime;
import java.util.*;
@RestController @RequestMapping("/api")
public class StoreController {
 private final StoreOrderRepository orders; private final ProductRepository products; private final AppUserRepository users; private final com.ferreteriaguillermo.service.AiRecommendationService ai;
 @Value("${yape.owner-name:Ferretería Guillermo}") private String yapeOwner;
 @Value("${yape.phone:}") private String yapePhone;
 @Value("${yape.qr-url:}") private String yapeQr;
 public StoreController(StoreOrderRepository o,ProductRepository p,AppUserRepository u, com.ferreteriaguillermo.service.AiRecommendationService ai){orders=o;products=p;users=u;this.ai=ai;}
 public record Line(@NotNull Long productId,@Min(1) @Max(100) int quantity){}
 public record Checkout(@NotEmpty List<@Valid Line> items){}
 public record PaymentReport(@NotBlank @Size(min=4,max=100) String operationNumber,@NotBlank @Size(max=100) String payerName){}
 public record AdminDecision(@Size(max=500) String note){}
 private AppUser current(Authentication a){if(a==null)throw new ResponseStatusException(HttpStatus.UNAUTHORIZED); return users.findByEmailIgnoreCase(a.getName()).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED));}
 @PostMapping("/orders") @Transactional public StoreOrder create(@Valid @RequestBody Checkout body,Authentication auth){
  var user=current(auth); if(!"CUSTOMER".equals(user.getRole()))throw new ResponseStatusException(HttpStatus.FORBIDDEN);
  if(body.items().size()>100)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Demasiados productos");
  StoreOrder o=new StoreOrder();o.customer=user;o.customerName=user.getName();o.customerEmail=user.getEmail();o.customerPhone=user.getPhone();
  if(o.customerPhone==null||o.customerPhone.isBlank())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Actualiza tu teléfono antes de comprar");
  Set<Long> seen=new HashSet<>();
  for(var line:body.items()){
   if(!seen.add(line.productId()))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Producto repetido");
   Product product=products.findById(line.productId()).orElseThrow(()->new ResponseStatusException(HttpStatus.BAD_REQUEST,"Producto no disponible"));
   if(product.getPrice()==null||product.getPrice().signum()<=0)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Precio inválido");
   StoreOrderItem item=new StoreOrderItem();item.order=o;item.product=product;item.quantity=line.quantity();item.unitPrice=product.getPrice();o.items.add(item);
   o.total=o.total.add(product.getPrice().multiply(BigDecimal.valueOf(line.quantity())));
  }
  if(o.total.signum()<=0)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Pedido vacío");
  return orders.save(o);
 }
 @GetMapping("/orders/mine") @Transactional(readOnly=true) public List<StoreOrder> mine(Authentication auth){return orders.findByCustomerIdOrderByCreatedAtDesc(current(auth).getId());}
 @GetMapping("/admin/orders") @Transactional(readOnly=true) public List<StoreOrder> adminOrders(){return orders.findAllByOrderByCreatedAtDesc();}
 @GetMapping("/payments/config") public Map<String,Object> config(){return Map.of("method","YAPE","owner",yapeOwner,"phone",yapePhone,"qrUrl",yapeQr,"manualVerification",true);}
 @PostMapping("/orders/{id}/report-payment") @Transactional public StoreOrder report(@PathVariable Long id,@Valid @RequestBody PaymentReport input,Authentication auth){
  var user=current(auth);
  var order=orders.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
  if(!"CUSTOMER".equals(user.getRole())||!order.customer.getId().equals(user.getId()))throw new ResponseStatusException(HttpStatus.FORBIDDEN);
  if(!List.of("PENDING_PAYMENT","PAYMENT_REJECTED").contains(order.status))throw new ResponseStatusException(HttpStatus.CONFLICT,"Este pedido ya fue enviado a revisión");
  String reference=input.operationNumber().trim();
  if(!reference.matches("[a-zA-Z0-9\\-]{4,100}"))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Número de operación inválido");
  if(orders.existsByPaymentReferenceAndIdNotAndStatusNot(reference,id,"PAYMENT_REJECTED"))throw new ResponseStatusException(HttpStatus.CONFLICT,"Ese número de operación ya fue declarado en otro pedido");
  order.paymentReference=reference;order.payerName=input.payerName().trim();order.paymentReportedAt=LocalDateTime.now();order.status="PAYMENT_REVIEW";order.paymentReviewNote=null;order.updatedAt=LocalDateTime.now();return orders.save(order);
 }
 @PatchMapping("/admin/orders/{id}/payment") @Transactional public StoreOrder verify(@PathVariable Long id,@RequestParam String action,@RequestBody(required=false) AdminDecision decision){
  StoreOrder order=orders.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
  if(!"PAYMENT_REVIEW".equals(order.status))throw new ResponseStatusException(HttpStatus.CONFLICT,"Solo se pueden revisar pagos pendientes de verificación");
  if("approve".equals(action)){order.status="PAID";order.paidAt=LocalDateTime.now();order.paymentReviewNote=null;}
  else if("reject".equals(action)){order.status="PAYMENT_REJECTED";order.paymentReviewNote=decision==null?"No coincide el abono informado":decision.note();}
  else throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Acción inválida");
  order.updatedAt=LocalDateTime.now();return orders.save(order);
 }
 @PatchMapping("/admin/orders/{id}/fulfillment") @Transactional public StoreOrder fulfillment(@PathVariable Long id,@RequestParam String status){
  StoreOrder order=orders.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
  Map<String,String> transitions=Map.of("PAID","PREPARING","PREPARING","READY","READY","DELIVERED");
  if(!status.equals(transitions.get(order.status)))throw new ResponseStatusException(HttpStatus.CONFLICT,"Transición de pedido no permitida");
  order.status=status;order.updatedAt=LocalDateTime.now();return orders.save(order);
 }
 @GetMapping("/recommendations") public List<Product> recommendations(Authentication a){
  List<Long> best = orders.bestSellers().stream().map(x -> (Long) x[0]).toList();
  List<Long> ids = new ArrayList<>();
  List<Long> owned = List.of();
  if (a != null) {
    var u = users.findByEmailIgnoreCase(a.getName()).orElse(null);
    if (u != null && "CUSTOMER".equals(u.getRole())) owned = orders.purchasedIds(u.getId());
  }
  if (!owned.isEmpty()) {
    ids.addAll(orders.alsoBought(owned).stream().map(x -> (Long) x[0]).toList());
    List<Product> allProducts = products.findAll();
    Set<String> ownedCategories = new HashSet<>();
    for (Product p : allProducts) if (owned.contains(p.getId())) ownedCategories.add(p.getCategory().toLowerCase(java.util.Locale.ROOT));
    for (Product product : allProducts) {
      if (!owned.contains(product.getId()) && ownedCategories.contains(product.getCategory().toLowerCase(java.util.Locale.ROOT)) && !ids.contains(product.getId())) ids.add(product.getId());
    }
  }
  for (Long id : best) if (!owned.contains(id) && !ids.contains(id)) ids.add(id);
  if (ids.isEmpty()) for (Product p : products.findByFeaturedTrue()) if (!owned.contains(p.getId())) ids.add(p.getId());
  if (ids.isEmpty()) for (Product p : products.findAll()) if (!owned.contains(p.getId())) ids.add(p.getId());
  List<Product> candidates = new ArrayList<>();
  for (Long id : ids) products.findById(id).ifPresent(candidates::add);
  List<Product> purchased = new ArrayList<>();
  for (Long id : owned) products.findById(id).ifPresent(purchased::add);
  return ai.rank(candidates.stream().limit(25).toList(), purchased, !owned.isEmpty()).stream().limit(8).toList();
 }
}
