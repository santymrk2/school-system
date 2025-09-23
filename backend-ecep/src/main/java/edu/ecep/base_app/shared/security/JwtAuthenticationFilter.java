package edu.ecep.base_app.shared.security;

import edu.ecep.base_app.identidad.domain.Persona;
import edu.ecep.base_app.identidad.infrastructure.persistence.PersonaRepository;
import edu.ecep.base_app.identidad.application.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final PersonaRepository personaRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String jwt = extractTokenFromRequest(request);

        if (jwt != null) {
            jwtService.safeExtractUsername(jwt).ifPresent(email -> {
                if (SecurityContextHolder.getContext().getAuthentication() == null) {
                    personaRepository.findByEmail(email).ifPresent(persona -> {
                        if (jwtService.validateToken(jwt)) {
                            UsernamePasswordAuthenticationToken authToken =
                                    new UsernamePasswordAuthenticationToken(
                                            persona.getId().toString(),
                                            null,
                                            buildAuthorities(persona)
                                    );
                            authToken.setDetails(persona);
                            SecurityContextHolder.getContext().setAuthentication(authToken);
                        }
                    });
                }
            });
        }

        filterChain.doFilter(request, response);
    }

    private Set<SimpleGrantedAuthority> buildAuthorities(Persona persona) {
        if (persona.getRoles() == null) {
            return Set.of();
        }
        return persona.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .collect(Collectors.toSet());
    }

    // Extrae el token desde Cookie o Header Authorization
    private String extractTokenFromRequest(HttpServletRequest request) {
        // 1. Cookie
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }

        // 2. Header Authorization
        final String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        return null;
    }
}
