package com.ferreteriaguillermo.auth;

import com.ferreteriaguillermo.config.AdminTokenService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;

@RestController
@RequestMapping("/api/admin-auth")
public class AdminAuthController {
    private final UserRepository users;
    private final AdminTokenService tokens;
    private final DaoAuthenticationProvider provider;
    public AdminAuthController(UserRepository users, AdminTokenService tokens, UserDetailsService uds, PasswordEncoder encoder) {
        this.users = users;
        this.tokens = tokens;
        provider = new DaoAuthenticationProvider(uds);
        provider.setPasswordEncoder(encoder);
    }
    public record Credentials(String email, String password) {}
    public record AdminSession(String token, String name, String email, String role) {}
    @PostMapping("/login")
    public AdminSession login(@RequestBody Credentials data) {
        if (data.email() == null || data.password() == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Completa los campos");
        User user = users.findByEmailIgnoreCase(data.email()).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas"));
        if (!"ADMIN".equals(user.role)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo administradores");
        try { provider.authenticate(new UsernamePasswordAuthenticationToken(data.email(), data.password())); }
        catch (Exception e) { throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas"); }
        return new AdminSession(tokens.issue(user.email), user.name, user.email, user.role);
    }
    @PostMapping("/logout")
    public Map<String,String> logout(@RequestHeader(value="Authorization", required=false) String authorization) {
        if (authorization != null && authorization.startsWith("Bearer ")) tokens.revoke(authorization.substring(7));
        return Map.of("message", "Sesión administrativa cerrada");
    }
}
