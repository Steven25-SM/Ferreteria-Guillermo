package com.ferreteriaguillermo.products;
import jakarta.persistence.*;
import java.math.BigDecimal;
@Entity @Table(name="products")public class Product {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)public Long id;
    @Column(nullable=false)public String name;
    @Column(nullable=false,unique=true)public String sku;
    @Column(columnDefinition="text")public String description;
    @ManyToOne(optional=false)@JoinColumn(name="category_id")public Category category;
    @Column(nullable=false)public BigDecimal price;
    @Column(name="image_url",columnDefinition="text")public String imageUrl;
    @Column(nullable=false)public boolean active=true;
}
