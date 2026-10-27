package com.ferreteriaguillermo.inventory;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
@Entity @Table(name="stock_movements")public class StockMovement {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)public Long id;
    @Column(name="product_id")public Long productId;
    @Column(name="actor_id")public Long actorId;
    public String type;
    public int quantity;
    public String reason;
    @Column(name="created_at",insertable=false,updatable=false)public OffsetDateTime createdAt;
}
