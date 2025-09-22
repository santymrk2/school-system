package edu.ecep.base_app.config;

import edu.ecep.base_app.domain.Persona;
import edu.ecep.base_app.repos.PersonaRepository;
import edu.ecep.base_app.service.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;
import java.util.Optional;


@Component
@Slf4j
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtService jwtService;
    private final PersonaRepository personaRepository;

    public JwtHandshakeInterceptor(JwtService jwtService, PersonaRepository personaRepository) {
        this.jwtService = jwtService;
        this.personaRepository = personaRepository;
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request,
                                   ServerHttpResponse response,
                                   WebSocketHandler wsHandler,
                                   Map<String, Object> attributes) throws Exception {
        if (request instanceof ServletServerHttpRequest servletRequest) {
            HttpServletRequest req = servletRequest.getServletRequest();

            String token = null;
            if (req.getCookies() != null) {
                for (Cookie cookie : req.getCookies()) {
                    if ("token".equals(cookie.getName())) {
                        token = cookie.getValue();
                        break;
                    }
                }
                if (token != null && !token.isBlank()) {
                    log.info("🍪 Cookie token recibida para handshake");
                }
            }

            if (token == null || token.isBlank()) {
                String paramToken = req.getParameter("token");
                if (paramToken != null && !paramToken.isBlank()) {
                    token = paramToken;
                    log.info("🔗 Token recibido vía query parameter en handshake");
                }
            }

            if (token == null || token.isBlank()) {
                String authHeader = req.getHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    String headerToken = authHeader.substring(7);
                    if (!headerToken.isBlank()) {
                        token = headerToken;
                        log.info("📝 Token recibido desde header Authorization en handshake");
                    }
                }
            }

            if (token != null && !token.isBlank() && jwtService.validateToken(token)) {
                Optional<Long> personaIdFromToken = jwtService.safeExtractPersonaId(token);
                if (personaIdFromToken.isPresent()) {
                    Long personaId = personaIdFromToken.get();
                    Optional<Persona> personaOpt = personaRepository.findById(personaId);
                    if (personaOpt.isPresent()) {
                        log.info("✅ Persona autenticada en WS (claim personaId): {}", personaId);
                        attributes.put("user", personaId.toString());
                        return true;
                    }
                    log.warn("⚠️ Persona {} no encontrada al validar token via claim personaId", personaId);
                }

                Optional<String> emailOpt = jwtService.safeExtractUsername(token);
                if (emailOpt.isPresent()) {
                    Optional<Persona> personaOpt = personaRepository.findByEmail(emailOpt.get());
                    if (personaOpt.isPresent()) {
                        Persona persona = personaOpt.get();
                        log.info("✅ Persona autenticada en WS (fallback email): {}", persona.getId());
                        attributes.put("user", persona.getId().toString());
                        return true;
                    }
                    log.warn("⚠️ No se encontró persona con email {} para handshake", emailOpt.get());
                } else {
                    log.warn("⚠️ Token válido pero sin subject/email disponible");
                }
            }
            log.warn("⚠️ No se pudo autenticar el handshake de WebSocket");
        }
        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request,
                               ServerHttpResponse response,
                               WebSocketHandler wsHandler,
                               Exception exception) {
        // No es necesario implementar este método
    }
}
