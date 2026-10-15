package com.ferreteriaguillermo.model;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
@Entity @Table(name="store_orders")
public class StoreOrder {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @ManyToOne(optional=false) @JsonIgnore public AppUser customer;
 public String customerName,customerEmail,customerPhone;
 @Column(nullable=false) public String status="PENDING_PAYMENT";
 @Column(nullable=false,precision=12,scale=2) public BigDecimal total=BigDecimal.ZERO;
 @Column(nullable=false) public LocalDateTime createdAt=LocalDateTime.now();
 public LocalDateTime paidAt;
 public String paymentReference;
 public String payerName;
 public LocalDateTime paymentReportedAt;
 public String paymentReviewNote;
 public LocalDateTime updatedAt;
 public String paymentMethod="YAPE";
 @OneToMany(mappedBy="order",cascade=CascadeType.ALL,orphanRemoval=true) public List<StoreOrderItem> items=new ArrayList<>();
 public Long getId(){return id;} public String getCustomerName(){return customerName;} public String getCustomerEmail(){return customerEmail;} public String getCustomerPhone(){return customerPhone;} public String getStatus(){return status;} public BigDecimal getTotal(){return total;} public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getPaidAt(){return paidAt;} public String getPaymentReference(){return paymentReference;} public String getPayerName(){return payerName;} public LocalDateTime getPaymentReportedAt(){return paymentReportedAt;}
 public String getPaymentReviewNote(){return paymentReviewNote;} public LocalDateTime getUpdatedAt(){return updatedAt;}
 public String getPaymentMethod(){return paymentMethod;}
 public List<StoreOrderItem> getItems(){return items;}
}