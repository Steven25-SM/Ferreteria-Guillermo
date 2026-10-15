package com.ferreteriaguillermo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "app_users")
public class AppUser {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true) private String email;
    @Column(nullable = false) private String password;
    @Column(nullable = false) private String name;
    @Column(nullable = false) private String role = "ADMIN";
    private String phone;
    @Column(length = 5000) private String avatarUrl;
    public AppUser() {}
    public AppUser(String email, String password, String name, String role) { this.email=email; this.password=password; this.name=name; this.role=role; }
    public Long getId(){return id;} public String getEmail(){return email;} public String getPassword(){return password;} public String getName(){return name;} public String getRole(){return role;}
    public String getPhone(){return phone;} public void setPhone(String phone){this.phone=phone;}
    public String getAvatarUrl(){return avatarUrl;} public void setAvatarUrl(String avatarUrl){this.avatarUrl=avatarUrl;}
    public void setId(Long id){this.id=id;} public void setEmail(String email){this.email=email;} public void setPassword(String password){this.password=password;} public void setName(String name){this.name=name;} public void setRole(String role){this.role=role;}
}
