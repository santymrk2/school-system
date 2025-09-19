package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.AuthResponse;
import edu.ecep.base_app.dtos.LoginRequest;
import edu.ecep.base_app.dtos.PersonaCreateDTO;
import edu.ecep.base_app.dtos.PersonaResumenDTO;
import edu.ecep.base_app.service.AuthService;
import edu.ecep.base_app.service.JwtService;
import edu.ecep.base_app.service.PersonaAccountService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final PersonaAccountService personaAccountService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @Validated LoginRequest request) {
        AuthResponse response = authService.login(request.getEmail(), request.getPassword());
        ResponseCookie cookie = ResponseCookie
                .from("token", response.getToken())
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(Duration.ofDays(1))
                .sameSite("Lax")
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody @Validated PersonaCreateDTO request) {
        AuthResponse response = authService.register(request);
        ResponseCookie cookie = ResponseCookie
                .from("token", response.getToken())
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(Duration.ofDays(1))
                .sameSite("Lax")
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
        ResponseCookie deleteCookie = ResponseCookie
                .from("token", "")
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, deleteCookie.toString());
        return ResponseEntity.ok(Map.of("message", "logout ok"));
    }

    @GetMapping("/me")
    public ResponseEntity<PersonaResumenDTO> getCurrentUser(
            @CookieValue(name = "token", required = false) String token,
            Authentication authentication) {

        String email = Optional.ofNullable(token)
                .flatMap(jwtService::safeExtractUsername)
                .orElseGet(() -> authentication != null ? authentication.getName() : null);

        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return authService.getCurrentUserDTO(email)
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    try {
                        return ResponseEntity.ok(
                                personaAccountService.toResumen(personaAccountService.getCurrentPersona())
                        );
                    } catch (Exception ex) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                    }
                });
    }
}
