package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.Persona;
import edu.ecep.base_app.domain.Usuario;
import edu.ecep.base_app.dtos.AuthResponse;
import edu.ecep.base_app.domain.enums.UserRole;
import edu.ecep.base_app.dtos.UsuarioBusquedaDTO;
import edu.ecep.base_app.repos.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;

@Service
public class AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    // LOGIN
    public AuthResponse login(String email, String password) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        if (!passwordEncoder.matches(password, usuario.getPassword())) {
            throw new BadCredentialsException("Credenciales inválidas");
        }

        String token = jwtService.generateToken(usuario);
        return new AuthResponse(token, usuario.getEmail(), usuario.getUserRoles());
    }

    // REGISTER
    public AuthResponse register(Usuario request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setEmail(request.getEmail());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setUserRoles(Set.of(UserRole.USER)); // Rol por defecto

        usuario = usuarioRepository.save(usuario);

        String token = jwtService.generateToken(usuario);

        return new AuthResponse(token, usuario.getEmail(), usuario.getUserRoles());
    }

    // NUEVO MÉTODO: Obtener usuario actual como DTO
    public Optional<UsuarioBusquedaDTO> getCurrentUserDTO(String email) {
        return usuarioRepository.findByEmail(email)
                .map(usuario -> {
                    Persona p = usuario.getPersona();
                    return new UsuarioBusquedaDTO(
                            usuario.getId(),
                            usuario.getEmail(),
                            usuario.getUserRoles(),
                            p != null ? p.getId() : null,
                            p != null ? p.getNombre() + " " + p.getApellido() : null,
                            p != null ? p.getDni() : null,
                            p != null ? p.getClass().getSimpleName() : null
                    );
                });
    }
}
