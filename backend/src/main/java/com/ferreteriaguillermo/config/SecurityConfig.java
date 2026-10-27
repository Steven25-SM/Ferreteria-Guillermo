package com.ferreteriaguillermo.config;
import com.ferreteriaguillermo.auth.User;
import com.ferreteriaguillermo.auth.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
@Configuration public class SecurityConfig {
    @Bean PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Bean UserDetailsService users(UserRepository repo) {
        return email-> {
            User u=repo.findByEmailIgnoreCase(email).orElseThrow(()->new org.springframework.security.core.userdetails.UsernameNotFoundException("Usuario no encontrado"));
            return org.springframework.security.core.userdetails.User.withUsername(u.email).password(u.passwordHash).roles(u.role).build();
        };
    }
    @Bean @org.springframework.core.annotation.Order(1)
    SecurityFilterChain adminChain(HttpSecurity http, AdminTokenService tokens) throws Exception {
        return http.securityMatcher("/api/admin/**")
            .csrf(csrf -> csrf.disable()) // Desarrollo local: aplicar CSRF/controles adicionales antes de producción.
            .sessionManagement(sm -> sm.sessionCreationPolicy(org.springframework.security.config.http.SessionCreationPolicy.STATELESS))
            .securityContext(sc -> sc.securityContextRepository(new org.springframework.security.web.context.NullSecurityContextRepository()))
            .addFilterBefore(new AdminTokenFilter(tokens), org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(a -> a.anyRequest().hasRole("ADMIN"))
            .formLogin(f -> f.disable()).httpBasic(b -> b.disable())
            .exceptionHandling(e -> e.authenticationEntryPoint((req,res,ex)->res.sendError(401,"Acceso administrativo requerido")))
            .build();
    }
    @Bean @org.springframework.core.annotation.Order(2)
    SecurityFilterChain customerChain(HttpSecurity http) throws Exception {
        return http.csrf(csrf -> csrf.disable()) // Desarrollo local: habilitar CSRF antes de desplegar.
            .authorizeHttpRequests(a -> a.requestMatchers("/api/admin-auth/**", "/api/auth/login", "/api/auth/register", "/api/auth/logout").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products/**", "/api/categories").permitAll()
                .requestMatchers("/api/orders/**", "/api/auth/me", "/api/auth/profile", "/api/interactions", "/api/recommendations/**").hasRole("CUSTOMER")
                .anyRequest().permitAll())
            .formLogin(f->f.disable()).httpBasic(b->b.disable())
            .exceptionHandling(e->e.authenticationEntryPoint((req,res,ex)->res.sendError(401,"No autorizado"))).build();
    }
    @Bean CommandLineRunner adminBootstrap(UserRepository repo,PasswordEncoder encoder,@Value("${ADMIN_INITIAL_PASSWORD:}")String password,@Value("${ADMIN_EMAIL:admin@ferreteriaguillermo.pe}")String email) {
        return args-> {
            if(repo.countByRole("ADMIN")==0) {
                if(password.length()<12)throw new IllegalStateException("Define ADMIN_INITIAL_PASSWORD de al menos 12 caracteres antes del primer inicio.");
                User u=new User();
                u.name="Administrador";
                u.email=email.toLowerCase();
                u.passwordHash=encoder.encode(password);
                u.role="ADMIN";
                repo.save(u);
            }
        };
    }
}
