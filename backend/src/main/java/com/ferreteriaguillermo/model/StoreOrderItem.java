package com.ferreteriaguillermo.model;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;
@Entity @Table(name="store_order_items")
public class StoreOrderItem {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @ManyToOne(optional=false) @JsonIgnore public StoreOrder order;
 @ManyToOne(optional=false) public Product product;
 @Column(nullable=false) public int quantity;
 @Column(nullable=false,precision=12,scale=2) public BigDecimal unitPrice;
 public Long getId(){return id;} public Product getProduct(){return product;} public int getQuantity(){return quantity;} public BigDecimal getUnitPrice(){return unitPrice;}
}