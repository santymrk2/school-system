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
                String email = jwtService.extractUsername(token);
                Optional<Persona> personaOpt = personaRepository.findByEmail(email);

                if (personaOpt.isPresent()) {
                    Persona persona = personaOpt.get();
                    log.info("✅ Persona autenticada en WS: {}", persona.getId());
                    attributes.put("user", persona.getId().toString());
                    return true;
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
