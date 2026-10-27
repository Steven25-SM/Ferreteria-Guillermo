package com.ferreteriaguillermo.products;
import com.ferreteriaguillermo.inventory.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.*;
@RestController public class ProductController {
    private final ProductRepository products;
    private final CategoryRepository categories;
    private final InventoryRepository inventory;
    private final StockService stock;
    private final com.ferreteriaguillermo.recommendations.RecommendationService recommendations;
    public ProductController(ProductRepository p,CategoryRepository c,InventoryRepository i,StockService s,com.ferreteriaguillermo.recommendations.RecommendationService recommendations) {
        this.recommendations=recommendations;
        products=p;
        categories=c;
        inventory=i;
        stock=s;
    }
    public record View(Long id,String name,String sku,String description,Long categoryId,String categoryName,BigDecimal price,String imageUrl,int stock,int minimumStock,boolean available) {
    }
    private View view(Product p) {
        Inventory i=inventory.findById(p.id).orElse(null);
        return new View(p.id,p.name,p.sku,p.description,p.category.id,p.category.name,p.price,p.imageUrl,i==null?0:i.quantity,i==null?0:i.minimumStock,i!=null&&i.quantity>0);
    }
    public record CategoryView(Long id,String name) {
    }
    @GetMapping("/api/categories")public List<CategoryView>categories() {
        return categories.findAll().stream().map(c->new CategoryView(c.id,c.name)).toList();
    }
    @GetMapping("/api/products")public List<View>list() {
        return products.findByActiveTrueOrderByIdDesc().stream().map(this::view).toList();
    }
    @GetMapping("/api/products/{id}")public View get(@PathVariable Long id) {
        Product p=products.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
        if(!p.active)throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return view(p);
    }
    @GetMapping("/api/admin/products")public List<View>adminList() {
        return products.findByActiveTrueOrderByIdDesc().stream().map(this::view).toList();
    }
    public record ProductInput(String name,String sku,String description,Long categoryId,BigDecimal price,String imageUrl,Integer initialStock,Integer minimumStock) {
    }
    private void fill(Product p,ProductInput d) {
        if(d.name()==null||d.name().isBlank()||d.sku()==null||d.sku().isBlank()||d.price()==null||d.price().signum()<0)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Datos de producto inválidos");
        p.name=d.name().trim();
        p.sku=d.sku().trim();
        p.description=d.description();
        p.category=categories.findById(d.categoryId()==null?-1L:d.categoryId()).orElseThrow(()->new ResponseStatusException(HttpStatus.BAD_REQUEST,"Categoría no encontrada"));
        p.price=d.price();
        p.imageUrl=d.imageUrl();
    }
    @Transactional @PostMapping("/api/admin/products")public View create(@RequestBody ProductInput d) {
        if(products.existsBySkuIgnoreCase(d.sku()==null?"":d.sku()))throw new ResponseStatusException(HttpStatus.CONFLICT,"SKU duplicado");
        Product p=new Product();
        fill(p,d);
        products.saveAndFlush(p);
        Inventory inv=new Inventory();
        inv.product=p;
        inv.quantity=Math.max(0,d.initialStock()==null?0:d.initialStock());
        inv.minimumStock=Math.max(0,d.minimumStock()==null?5:d.minimumStock());
        inventory.save(inv);
        return view(p);
    }
    @Transactional @PutMapping("/api/admin/products/{id}")public View edit(@PathVariable Long id,@RequestBody ProductInput d) {
        Product p=products.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
        if(products.findAll().stream().anyMatch(x->!x.id.equals(id)&&x.sku.equalsIgnoreCase(d.sku())))throw new ResponseStatusException(HttpStatus.CONFLICT,"SKU duplicado");
        fill(p,d);
        products.save(p);
        Inventory inv=inventory.findById(id).orElseThrow();
        inv.minimumStock=Math.max(0,d.minimumStock()==null?5:d.minimumStock());
        inventory.save(inv);
        return view(p);
    }
    @DeleteMapping("/api/admin/products/{id}")@Transactional public void deactivate(@PathVariable Long id) {
        Product p=products.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
        p.active=false;
        products.save(p);
    }
    public record MovementInput(Long productId,String type,int quantity,String reason) {
    }
    @PostMapping("/api/admin/inventory/movements")public Map<String,String>move(@RequestBody MovementInput m,org.springframework.security.core.Authentication a,com.ferreteriaguillermo.auth.UserRepository u) {
        var user=u.findByEmailIgnoreCase(a.getName()).orElseThrow();
        stock.move(m.productId(),m.type(),m.quantity(),user.id,m.reason());
        return Map.of("message","Movimiento registrado");
    }
    @GetMapping("/api/products/best-sellers")public List<View>bestSellers() {
        return recommendations.bestSellers().stream().map(this::view).toList();
    }
    @GetMapping("/api/products/recommended")public List<View>recommended(org.springframework.security.core.Authentication auth) {
        Long id=recommendations.customerId(auth==null?null:auth.getName());
        return recommendations.recommended(id).stream().map(this::view).toList();
    }
}
