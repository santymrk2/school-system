package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.Persona;
import edu.ecep.base_app.domain.enums.UserRole;
import edu.ecep.base_app.dtos.AuthResponse;
import edu.ecep.base_app.dtos.PersonaCreateDTO;
import edu.ecep.base_app.dtos.PersonaResumenDTO;
import edu.ecep.base_app.mappers.PersonaMapper;
import edu.ecep.base_app.repos.PersonaRepository;
import edu.ecep.base_app.util.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PersonaRepository personaRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PersonaMapper personaMapper;
    private final PersonaAccountService personaAccountService;

    public AuthResponse login(String email, String password) {
        Persona persona = personaRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Credenciales inválidas"));
        if (persona.getPassword() == null || !passwordEncoder.matches(password, persona.getPassword())) {
            throw new BadCredentialsException("Credenciales inválidas");
        }
        String token = jwtService.generateToken(persona);
        return AuthResponse.fromPersona(token, persona);
    }

    public AuthResponse register(PersonaCreateDTO request) {
        if (request.getEmail() != null && personaRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }
        if (personaRepository.existsByDni(request.getDni())) {
            throw new IllegalArgumentException("Ya existe una persona con ese DNI");
        }

        Persona persona = personaMapper.toEntity(request);
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            persona.setPassword(passwordEncoder.encode(request.getPassword()));
        } else {
            persona.setPassword(null);
        }
        Set<UserRole> roles = request.getRoles() == null || request.getRoles().isEmpty()
                ? Set.of(UserRole.USER)
                : new HashSet<>(request.getRoles());
        persona.setRoles(new HashSet<>(roles));

        Persona saved = personaRepository.save(persona);
        String token = jwtService.generateToken(saved);
        return AuthResponse.fromPersona(token, saved);
    }

    public Optional<PersonaResumenDTO> getCurrentUserDTO(String email) {
        return personaRepository.findByEmail(email)
                .map(personaAccountService::toResumen);
    }

    public void updatePassword(Long personaId, String rawPassword) {
        Persona persona = personaRepository.findById(personaId)
                .orElseThrow(NotFoundException::new);
        persona.setPassword(passwordEncoder.encode(rawPassword));
        personaRepository.save(persona);
    }
}
