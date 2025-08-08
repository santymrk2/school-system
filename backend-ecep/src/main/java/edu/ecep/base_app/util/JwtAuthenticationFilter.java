package edu.ecep.base_app.util;

import edu.ecep.base_app.domain.Usuario;
import edu.ecep.base_app.repos.UsuarioRepository;
import edu.ecep.base_app.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String jwt = extractTokenFromRequest(request);

        if (jwt != null) {
            jwtService.safeExtractUsername(jwt).ifPresent(email -> {
                if (SecurityContextHolder.getContext().getAuthentication() == null) {
                    usuarioRepository.findByEmail(email).ifPresent(usuario -> {
                        if (jwtService.validateToken(jwt)) {
                            UsernamePasswordAuthenticationToken authToken =
                                    new UsernamePasswordAuthenticationToken(
                                            usuario.getId().toString(),
                                            null,
                                            usuario.getAuthorities()
                                    );
                            authToken.setDetails(usuario); // Guarda info extra
                            SecurityContextHolder.getContext().setAuthentication(authToken);
                        }
                    });
                }
            });
        }

        filterChain.doFilter(request, response);
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
