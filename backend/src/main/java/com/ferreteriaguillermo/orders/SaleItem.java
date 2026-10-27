package com.ferreteriaguillermo.orders;
import jakarta.persistence.*;
import java.math.BigDecimal;
@Entity @Table(name="sale_items")public class SaleItem {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)public Long id;
    @Column(name="sale_id")public Long saleId;
    @Column(name="product_id")public Long productId;
    public int quantity;
    @Column(name="unit_price")public BigDecimal unitPrice;
}
