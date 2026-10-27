package com.ferreteriaguillermo.products;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ProductRepository extends JpaRepository<Product,Long> {
    List<Product> findByActiveTrueOrderByIdDesc();
    List<Product> findAllByOrderByIdDesc();
    boolean existsBySkuIgnoreCase(String sku);
}
