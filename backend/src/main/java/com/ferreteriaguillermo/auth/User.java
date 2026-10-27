package com.ferreteriaguillermo.auth;
import jakarta.persistence.*;
@Entity @Table(name="app_users")public class User {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)public Long id;
    @Column(nullable=false)public String name;
    @Column(nullable=false,unique=true)public String email;
    @Column(name="password_hash",nullable=false)public String passwordHash;
    @Column(nullable=false)public String role;
}
