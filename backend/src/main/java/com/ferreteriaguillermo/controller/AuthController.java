package com.ferreteriaguillermo.controller;

import com.ferreteriaguillermo.dto.LoginRequest;
import com.ferreteriaguillermo.model.AppUser;
import com.ferreteriaguillermo.repository.AppUserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository contextRepository;
    private final AppUserRepository users;
    private final org.springframework.security.crypto.password.PasswordEncoder encoder;

    public AuthController(AuthenticationManager authenticationManager, SecurityContextRepository contextRepository, AppUserRepository users, org.springframework.security.crypto.password.PasswordEncoder encoder) {
        this.authenticationManager = authenticationManager;
        this.contextRepository = contextRepository;
        this.users = users;
        this.encoder = encoder;
    }

    public record Register(
            @jakarta.validation.constraints.NotBlank String name,
            @jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Pattern(regexp = "(^$|[0-9]{9})", message = "Ingresa un celular peruano de 9 dígitos") String phone,
            @jakarta.validation.constraints.Email @jakarta.validation.constraints.NotBlank String email,
            @jakarta.validation.constraints.Size(min = 8) String password
    ) {}

    public record UpdatePhone(
            @jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Pattern(regexp = "[0-9]{9}") String phone
    ) {}

    public record ProfileUpdate(
            @jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max = 120) String name,
            @jakarta.validation.constraints.Pattern(regexp = "(^$|[0-9]{9})", message = "Ingresa un celular peruano de 9 dígitos") String phone,
            @jakarta.validation.constraints.Size(max = 5000) String avatarUrl
    ) {}

    private Map<String, Object> toPayload(AppUser u) {
        return Map.of(
                "email", u.getEmail(),
                "name", u.getName(),
                "role", u.getRole(),
                "phone", u.getPhone() == null ? "" : u.getPhone(),
                "avatarUrl", u.getAvatarUrl() == null ? "" : u.getAvatarUrl()
        );
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody Register body) {
        String email = body.email().trim().toLowerCase(Locale.ROOT);
        if (users.findByEmailIgnoreCase(email).isPresent()) {
            return ResponseEntity.status(409).body(Map.of("message", "El correo ya está registrado."));
        }
        var u = new AppUser(email, encoder.encode(body.password()), body.name().trim(), "CUSTOMER");
        u.setPhone(body.phone().trim());
        users.save(u);
        return ResponseEntity.status(201).body(toPayload(u));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest body, HttpServletRequest request, HttpServletResponse response) {
        try {
            Authentication auth = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(body.email(), body.password()));
            var context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(auth);
            SecurityContextHolder.setContext(context);
            contextRepository.saveContext(context, request, response);
            var u = users.findByEmailIgnoreCase(auth.getName()).orElseThrow();
            return ResponseEntity.ok(toPayload(u));
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(401).body(Map.of("message", "Correo o contraseña incorrectos."));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return ResponseEntity.status(401).build();
        var u = users.findByEmailIgnoreCase(auth.getName()).orElseThrow();
        return ResponseEntity.ok(toPayload(u));
    }

    @PutMapping("/phone")
    public ResponseEntity<?> updatePhone(@Valid @RequestBody UpdatePhone body, Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).build();
        var u = users.findByEmailIgnoreCase(auth.getName()).orElseThrow();
        if (!"CUSTOMER".equals(u.getRole())) return ResponseEntity.status(403).build();
        u.setPhone(body.phone());
        users.save(u);
        return ResponseEntity.ok(toPayload(u));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody ProfileUpdate body, Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).build();
        var u = users.findByEmailIgnoreCase(auth.getName()).orElseThrow();
        u.setName(body.name().trim());
        if (body.phone() != null && !body.phone().isBlank()) u.setPhone(body.phone().trim());
        u.setAvatarUrl(body.avatarUrl() == null ? null : body.avatarUrl().trim());
        users.save(u);
        return ResponseEntity.ok(toPayload(u));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest req) {
        var s = req.getSession(false);
        if (s != null) s.invalidate();
        SecurityContextHolder.clearContext();
        return ResponseEntity.noContent().build();
    }
}
