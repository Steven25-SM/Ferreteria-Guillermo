package com.ferreteriaguillermo.config;

import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AdminTokenService {
    private final SecureRandom random = new SecureRandom();
    private final ConcurrentHashMap<String, Entry> tokens = new ConcurrentHashMap<>();
    private record Entry(String email, Instant expiresAt) {}

    public String issue(String email) {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        tokens.put(token, new Entry(email, Instant.now().plus(8, ChronoUnit.HOURS)));
        return token;
    }
    public String resolve(String token) {
        if (token == null) return null;
        Entry entry = tokens.get(token);
        if (entry == null) return null;
        if (Instant.now().isAfter(entry.expiresAt())) { tokens.remove(token); return null; }
        return entry.email();
    }
    public void revoke(String token) { if (token != null) tokens.remove(token); }
}
