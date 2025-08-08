package edu.ecep.base_app.config;

import edu.ecep.base_app.domain.Usuario;
import edu.ecep.base_app.repos.UsuarioRepository;
import edu.ecep.base_app.service.JwtService;
import jakarta.servlet.http.Cookie;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.Optional;


@Component
@Slf4j
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    public JwtHandshakeInterceptor(JwtService jwtService, UsuarioRepository usuarioRepository) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
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
            }
            if (token != null) {
                log.info("🍪 Cookie token recibida: {}", token);
            } else {
                log.warn("⚠️ Cookie token NO recibida");
            }

            if (token != null && jwtService.validateToken(token)) {
                String email = jwtService.extractUsername(token);
                Optional<Usuario> userOpt = usuarioRepository.findByEmail(email);

                if (userOpt.isPresent()) {
                    Usuario usuario = userOpt.get();
                    log.info("✅ Usuario autenticado en WS: {}", usuario.getId());
                    attributes.put("user", usuario.getId().toString());
                    return true;
                }
            }
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
