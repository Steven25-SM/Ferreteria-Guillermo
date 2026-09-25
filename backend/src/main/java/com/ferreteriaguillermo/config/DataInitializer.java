package com.ferreteriaguillermo.config;

import com.ferreteriaguillermo.model.Product;
import com.ferreteriaguillermo.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.List;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner seedProducts(ProductRepository repository) {
        return args -> {
            if (repository.count() > 0) return;

            repository.saveAll(List.of(
                p("Taladro Percutor 650W","Herramientas",189.90,229.90,"🔨",4.8,true),
                p("Set Profesional 108 piezas","Herramientas",129.90,159.90,"🧰",4.9,true),
                p("Cable Eléctrico 100m","Electricidad",89.90,99.90,"🔌",4.7,true),
                p("Pintura Látex 4L","Pintura",49.90,59.90,"🎨",4.6,true),
                p("Martillo Profesional","Herramientas",39.90,null,"🔨",4.8,false),
                p("Interruptor Doble","Electricidad",12.90,null,"💡",4.5,false),
                p("Cemento Tipo I","Construcción",32.90,null,"🧱",4.7,false),
                p("Brocha 4 pulgadas","Pintura",15.90,null,"🖌️",4.6,false),
                p("Alicate Universal","Herramientas",24.90,null,"🗜️",4.5,false),
                p("Tomacorriente Doble","Electricidad",18.90,null,"🔌",4.6,false),
                p("Rodillo para Pintura","Pintura",22.90,null,"🖌️",4.4,false),
                p("Ladrillo King Kong","Construcción",2.90,null,"🧱",4.7,false)
            ));
        };
    }

    private Product p(String name, String category, double price, Double oldPrice,
                      String icon, double rating, boolean featured) {
        return new Product(
            name, category, BigDecimal.valueOf(price),
            oldPrice == null ? null : BigDecimal.valueOf(oldPrice),
            icon, BigDecimal.valueOf(rating), featured
        );
    }
}
