package com.ferreteriaguillermo.products;
import jakarta.persistence.*;
@Entity @Table(name="categories")public class Category {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)public Long id;
    @Column(nullable=false)public String name;
}
