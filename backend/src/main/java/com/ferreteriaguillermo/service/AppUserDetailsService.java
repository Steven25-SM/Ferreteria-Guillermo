package com.ferreteriaguillermo.service;
import com.ferreteriaguillermo.repository.AppUserRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
@Service
public class AppUserDetailsService implements UserDetailsService {
    private final AppUserRepository repository;
    public AppUserDetailsService(AppUserRepository repository){this.repository=repository;}
    @Override public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        var u=repository.findByEmailIgnoreCase(email).orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
        return User.withUsername(u.getEmail()).password(u.getPassword()).roles(u.getRole()).build();
    }
}
