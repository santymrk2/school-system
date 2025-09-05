package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.LoginRequest;
import edu.ecep.base_app.dtos.UsuarioBusquedaDTO;
import edu.ecep.base_app.repos.UsuarioRepository;
import edu.ecep.base_app.service.JwtService;
import edu.ecep.base_app.service.UsuarioService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import java.time.Duration;
import java.util.Map;

import edu.ecep.base_app.domain.Usuario;
import edu.ecep.base_app.dtos.AuthResponse;
import edu.ecep.base_app.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private AuthService authService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        AuthResponse data = authService.login(req.getEmail(), req.getPassword());
        ResponseCookie cookie = ResponseCookie
                .from("token", data.getToken())
                .httpOnly(true)
                .secure(false)   // true en prod con HTTPS
                .path("/")
                .maxAge(Duration.ofDays(1))
                .sameSite("Lax")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of("email", data.getEmail(), "roles", data.getUserRoles()));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody Usuario request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie deleteCookie = ResponseCookie
                .from("token", "")
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, deleteCookie.toString());
        return ResponseEntity.ok(Map.of("message", "logout ok"));
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioBusquedaDTO> getCurrentUser(
            @CookieValue(name = "token", required = false) String token,
            Authentication auth) {

        String email = (token != null)
                ? jwtService.extractUsername(token)
                : (auth != null ? auth.getName() : null);

        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return authService.getCurrentUserDTO(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


}
