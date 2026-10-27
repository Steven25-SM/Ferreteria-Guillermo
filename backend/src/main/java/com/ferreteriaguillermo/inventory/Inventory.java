package com.ferreteriaguillermo.inventory;
import jakarta.persistence.*;
import com.ferreteriaguillermo.products.Product;
@Entity @Table(name="inventory")public class Inventory {
    @Id @Column(name="product_id")public Long productId;
    @OneToOne(fetch=FetchType.LAZY)@MapsId @JoinColumn(name="product_id")public Product product;
    @Column(nullable=false)public int quantity;
    @Column(name="minimum_stock",nullable=false)public int minimumStock=5;
}
