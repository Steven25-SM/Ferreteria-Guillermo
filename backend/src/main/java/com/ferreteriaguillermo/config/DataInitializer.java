package com.ferreteriaguillermo.config;

import com.ferreteriaguillermo.model.AppUser;
import com.ferreteriaguillermo.model.Product;
import com.ferreteriaguillermo.repository.AppUserRepository;
import com.ferreteriaguillermo.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedProducts(ProductRepository repository, AppUserRepository users, PasswordEncoder encoder, @Value("${ADMIN_INITIAL_PASSWORD:}") String initialAdminPassword) {
        return args -> {
            if (users.count() == 0) {
                if (initialAdminPassword == null || initialAdminPassword.length() < 12) {
                    throw new IllegalStateException("Configura ADMIN_INITIAL_PASSWORD con al menos 12 caracteres antes del primer inicio.");
                }
                users.save(new AppUser("admin@ferreteriaguillermo.pe", encoder.encode(initialAdminPassword), "Administrador", "ADMIN"));
            }

            List<ProductSeed> catalog = baseCatalog();
            Map<String, Product> existingByName = repository.findAll().stream()
                    .collect(Collectors.toMap(p -> normalize(p.getName()), Function.identity(), (a, b) -> a, LinkedHashMap::new));

            for (ProductSeed seed : catalog) {
                Product current = existingByName.get(normalize(seed.name));
                if (current == null) {
                    repository.save(seed.toProduct());
                    continue;
                }
                boolean changed = false;
                if (current.getImageUrl() == null || current.getImageUrl().isBlank()) {
                    current.setImageUrl(seed.imageUrl);
                    changed = true;
                }
                if (current.getIcon() != null && !current.getIcon().isBlank()) {
                    current.setIcon(null);
                    changed = true;
                }
                if (current.getRating() == null) {
                    current.setRating(BigDecimal.valueOf(seed.rating));
                    changed = true;
                }
                if (changed) repository.save(current);
            }
        };
    }

    private List<ProductSeed> baseCatalog() {
        return List.of(
                s("Taladro Percutor 650W", "Herramientas", 189.90, 229.90, 4.8, true, "/images/products/taladro-percutor-650w.svg"),
                s("Set Profesional 108 piezas", "Herramientas", 129.90, 159.90, 4.9, true, "/images/products/set-profesional-108-piezas.svg"),
                s("Cable Eléctrico 100m", "Electricidad", 89.90, 99.90, 4.7, true, "/images/products/cable-electrico-100m.svg"),
                s("Pintura Látex 4L", "Pintura", 49.90, 59.90, 4.6, true, "/images/products/pintura-latex-4l.svg"),
                s("Martillo Profesional", "Herramientas", 39.90, null, 4.8, false, "/images/products/martillo-profesional.svg"),
                s("Interruptor Doble", "Electricidad", 12.90, null, 4.5, false, "/images/products/interruptor-doble.svg"),
                s("Cemento Tipo I", "Construcción", 32.90, null, 4.7, false, "/images/products/cemento-tipo-i.svg"),
                s("Brocha 4 pulgadas", "Pintura", 15.90, null, 4.6, false, "/images/products/brocha-4-pulgadas.svg"),
                s("Alicate Universal", "Herramientas", 24.90, null, 4.5, false, "/images/products/alicate-universal.svg"),
                s("Tomacorriente Doble", "Electricidad", 18.90, null, 4.6, false, "/images/products/tomacorriente-doble.svg"),
                s("Rodillo para Pintura", "Pintura", 22.90, null, 4.4, false, "/images/products/rodillo-para-pintura.svg"),
                s("Ladrillo King Kong", "Construcción", 2.90, null, 4.7, false, "/images/products/ladrillo-king-kong.svg"),
                s("Juego de Destornilladores", "Herramientas", 28.90, 34.90, 4.6, false, "/images/products/juego-destornilladores.svg"),
                s("Silicona Neutra", "Construcción", 16.50, null, 4.5, false, "/images/products/silicona-neutra.svg"),
                s("Tarugos Pack x50", "Construcción", 6.90, null, 4.4, false, "/images/products/tarugos-pack-50.svg"),
                s("Llave Ajustable 10 pulgadas", "Herramientas", 26.90, null, 4.7, false, "/images/products/llave-ajustable-10.svg"),
                s("Cinta Aislante", "Electricidad", 3.50, null, 4.4, false, "/images/products/cinta-aislante.svg"),
                s("Cerradura Pomo", "Construcción", 42.90, 49.90, 4.5, false, "/images/products/cerradura-pomo.svg")
        );
    }

    private ProductSeed s(String name, String category, double price, Double oldPrice, double rating, boolean featured, String imageUrl) {
        return new ProductSeed(name, category, price, oldPrice, rating, featured, imageUrl);
    }

    private String normalize(String input) {
        return input == null ? "" : input.trim().toLowerCase(Locale.ROOT);
    }

    private record ProductSeed(String name, String category, double price, Double oldPrice, double rating, boolean featured, String imageUrl) {
        Product toProduct() {
            Product p = new Product(name, category, BigDecimal.valueOf(price), oldPrice == null ? null : BigDecimal.valueOf(oldPrice), null, BigDecimal.valueOf(rating), featured);
            p.setImageUrl(imageUrl);
            return p;
        }
    }
}
