package com.ferreteriaguillermo.orders;
import jakarta.persistence.*;
import java.math.BigDecimal;
@Entity @Table(name="sales")public class Sale {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)public Long id;
    @Column(name="actor_id")public Long actorId;
    public BigDecimal total;
    @Column(name="payment_method")public String paymentMethod;
}
