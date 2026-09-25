package com.ferreteriaguillermo.controller;

import com.ferreteriaguillermo.model.Product;
import com.ferreteriaguillermo.service.ProductService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping
    public List<Product> all() {
        return service.findAll();
    }

    @GetMapping("/featured")
    public List<Product> featured() {
        return service.findFeatured();
    }
}
