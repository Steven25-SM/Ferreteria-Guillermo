package com.ferreteriaguillermo.service;

import com.ferreteriaguillermo.model.Product;
import com.ferreteriaguillermo.repository.ProductRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductService {
    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    public List<Product> findAll() {
        return repository.findAll();
    }

    public List<Product> findFeatured() {
        return repository.findByFeaturedTrue();
    }
}
