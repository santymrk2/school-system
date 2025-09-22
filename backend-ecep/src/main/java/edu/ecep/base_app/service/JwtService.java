package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.Persona;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    // Generar token
    public String generateToken(Persona persona) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", persona.getRoles() == null ? Set.of() : persona.getRoles());
        claims.put("email", persona.getEmail());
        claims.put("personaId", persona.getId());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(persona.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(SignatureAlgorithm.HS256, secret)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .setSigningKey(secret)
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public boolean validateToken(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    public Optional<String> safeExtractUsername(String token) {
        try {
            return Optional.ofNullable(extractUsername(token));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public Optional<Long> safeExtractPersonaId(String token) {
        try {
            Object personaId = extractAllClaims(token).get("personaId");
            if (personaId instanceof Number number) {
                return Optional.of(number.longValue());
            }
            if (personaId instanceof String str && !str.isBlank()) {
                return Optional.of(Long.valueOf(str));
            }
        } catch (Exception ignored) {
        }
        return Optional.empty();
    }
}
