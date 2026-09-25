package com.ferreteriaguillermo.repository;

import com.ferreteriaguillermo.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByFeaturedTrue();
    List<Product> findByCategoryIgnoreCase(String category);
}
