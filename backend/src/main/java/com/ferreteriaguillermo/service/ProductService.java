package com.ferreteriaguillermo.service;

import com.ferreteriaguillermo.dto.ProductRequest;
import com.ferreteriaguillermo.model.Product;
import com.ferreteriaguillermo.repository.ProductRepository;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductService {
    private final ProductRepository repository;
    public ProductService(ProductRepository repository) { this.repository = repository; }
    public List<Product> findAll() { return repository.findAll(); }
    public List<Product> findFeatured() { return repository.findByFeaturedTrue(); }
    public Product create(ProductRequest r) { return repository.save(apply(new Product(), r)); }
    public Product update(Long id, ProductRequest r) {
        Product p=repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Producto no encontrado."));
        return repository.save(apply(p,r));
    }
    public void delete(Long id) {
        if(!repository.existsById(id)) throw new IllegalArgumentException("Producto no encontrado.");
        repository.deleteById(id);
    }
    private Product apply(Product p, ProductRequest r){
        String image = r.imageUrl() == null ? "" : r.imageUrl().trim();
        if (!image.isEmpty() && !(image.startsWith("https://") || image.matches("^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$"))) {
            throw new IllegalArgumentException("Imagen no válida: usa HTTPS o JPG/PNG/WebP.");
        }
        p.setImageUrl(image);
        p.setName(r.name().trim()); p.setCategory(r.category().trim()); p.setPrice(r.price()); p.setOldPrice(r.oldPrice());
        p.setIcon(r.icon()==null || r.icon().isBlank()?"📦":r.icon().trim()); p.setRating(r.rating()==null? BigDecimal.valueOf(4.5):r.rating()); p.setFeatured(r.featured()); return p;
    }
}
