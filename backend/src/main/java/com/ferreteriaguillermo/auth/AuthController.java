package com.ferreteriaguillermo.auth;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;
@RestController @RequestMapping("/api/auth")public class AuthController {
    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final org.springframework.security.authentication.AuthenticationProvider provider;
    public AuthController(UserRepository repo,PasswordEncoder encoder,org.springframework.security.core.userdetails.UserDetailsService uds) {
        this.repo=repo;
        this.encoder=encoder;
        org.springframework.security.authentication.dao.DaoAuthenticationProvider p=new org.springframework.security.authentication.dao.DaoAuthenticationProvider(uds);
        p.setPasswordEncoder(encoder);
        this.provider=p;
    }
    public record Credentials(@Email String email,String password) {
    }
    public record Registration(@NotBlank String name,@Email String email,@Size(min=8)String password) {
    }
    public record UserView(Long id,String name,String email,String role) {
    }
    private UserView view(User u) {
        return new UserView(u.id,u.name,u.email,u.role);
    }
    private void authenticate(String email,String password,HttpServletRequest req) {
        Authentication a=provider.authenticate(new UsernamePasswordAuthenticationToken(email,password));
        SecurityContext ctx=SecurityContextHolder.createEmptyContext();
        ctx.setAuthentication(a);
        SecurityContextHolder.setContext(ctx);
        HttpSession session=req.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,ctx);
        req.changeSessionId();
    }
    @PostMapping("/login")public UserView login(@RequestBody Credentials data,HttpServletRequest req) {
        if(data.email()==null||data.password()==null)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Completa los campos");
        User candidate = repo.findByEmailIgnoreCase(data.email()).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Credenciales incorrectas"));
        if (!"CUSTOMER".equals(candidate.role)) throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Utiliza el acceso administrativo");
        try {
            authenticate(data.email(),data.password(),req);
        }
        catch(Exception ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Credenciales incorrectas");
        }
        return view(repo.findByEmailIgnoreCase(data.email()).orElseThrow());
    }
    @PostMapping("/register")public UserView register(@Valid @RequestBody Registration data,HttpServletRequest req) {
        if(repo.findByEmailIgnoreCase(data.email()).isPresent())throw new ResponseStatusException(HttpStatus.CONFLICT,"Correo ya registrado");
        User u=new User();
        u.name=data.name().trim();
        u.email=data.email().trim().toLowerCase();
        u.passwordHash=encoder.encode(data.password());
        u.role="CUSTOMER";
        repo.save(u);
        authenticate(u.email,data.password(),req);
        return view(u);
    }
    @GetMapping("/me")public UserView me(Authentication auth) {
        return view(repo.findByEmailIgnoreCase(auth.getName()).orElseThrow());
    }
    public record ProfileUpdate(@NotBlank @Size(max=100) String name,@Email @NotBlank String email) {}
    @PutMapping("/profile") @org.springframework.transaction.annotation.Transactional
    public UserView updateProfile(@Valid @RequestBody ProfileUpdate data,Authentication auth,HttpServletRequest req) {
        User u=repo.findByEmailIgnoreCase(auth.getName()).orElseThrow();
        if(!"CUSTOMER".equals(u.role))throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        String email=data.email().trim().toLowerCase();
        if(repo.findByEmailIgnoreCase(email).filter(other -> !other.id.equals(u.id)).isPresent())
            throw new ResponseStatusException(HttpStatus.CONFLICT,"Correo ya registrado");
        u.name=data.name().trim();
        u.email=email;
        repo.saveAndFlush(u);
        // Renueva el contexto de seguridad si el correo (username) cambió.
        Authentication current=new UsernamePasswordAuthenticationToken(u.email,null,auth.getAuthorities());
        SecurityContext ctx=SecurityContextHolder.createEmptyContext();
        ctx.setAuthentication(current);
        SecurityContextHolder.setContext(ctx);
        req.getSession(true).setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,ctx);
        return view(u);
    }
    @PostMapping("/logout")public Map<String,String>logout(HttpServletRequest req) {
        HttpSession session=req.getSession(false);
        if(session!=null)session.invalidate();
        SecurityContextHolder.clearContext();
        return Map.of("message","Sesión cerrada");
    }
}
