package com.ferreteriaguillermo.orders;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
@Entity @Table(name="orders")public class StoreOrder {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)public Long id;
    @Column(name="user_id")public Long userId;
    public String status="PENDING";
    public BigDecimal total;
    @Column(name="payment_method")public String paymentMethod;
    @Column(name="payment_status")public String paymentStatus="PENDING";
    @Column(name="created_at",insertable=false,updatable=false)public OffsetDateTime createdAt;
}
