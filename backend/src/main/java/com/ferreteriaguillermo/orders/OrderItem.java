package com.ferreteriaguillermo.orders;
import jakarta.persistence.*;
import java.math.BigDecimal;
@Entity @Table(name="order_items")public class OrderItem {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)public Long id;
    @Column(name="order_id")public Long orderId;
    @Column(name="product_id")public Long productId;
    public int quantity;
    @Column(name="unit_price")public BigDecimal unitPrice;
}
