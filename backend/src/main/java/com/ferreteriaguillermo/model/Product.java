package com.ferreteriaguillermo.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(precision = 12, scale = 2)
    private BigDecimal oldPrice;

    private String icon;

    private BigDecimal rating;

    private boolean featured;

    public Product() {}

    public Product(String name, String category, BigDecimal price, BigDecimal oldPrice,
                    String icon, BigDecimal rating, boolean featured) {
        this.name = name;
        this.category = category;
        this.price = price;
        this.oldPrice = oldPrice;
        this.icon = icon;
        this.rating = rating;
        this.featured = featured;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public BigDecimal getPrice() { return price; }
    public BigDecimal getOldPrice() { return oldPrice; }
    public String getIcon() { return icon; }
    public BigDecimal getRating() { return rating; }
    public boolean isFeatured() { return featured; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setCategory(String category) { this.category = category; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public void setOldPrice(BigDecimal oldPrice) { this.oldPrice = oldPrice; }
    public void setIcon(String icon) { this.icon = icon; }
    public void setRating(BigDecimal rating) { this.rating = rating; }
    public void setFeatured(boolean featured) { this.featured = featured; }
}
