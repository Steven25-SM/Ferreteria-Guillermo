package com.ferreteriaguillermo.controller;
import com.ferreteriaguillermo.dto.ProductRequest;
import com.ferreteriaguillermo.model.Product;
import com.ferreteriaguillermo.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/products")
public class ProductController {
    private final ProductService service;
    public ProductController(ProductService service) { this.service = service; }
    @GetMapping public List<Product> all(){return service.findAll();}
    @GetMapping("/featured") public List<Product> featured(){return service.findFeatured();}
    @PostMapping public Product create(@Valid @RequestBody ProductRequest r){return service.create(r);}
    @PutMapping("/{id}") public Product update(@PathVariable Long id,@Valid @RequestBody ProductRequest r){return service.update(id,r);}
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){service.delete(id);return ResponseEntity.noContent().build();}
}
