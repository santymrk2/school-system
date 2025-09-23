package edu.ecep.base_app.identidad.application;

import edu.ecep.base_app.identidad.domain.Persona;
import edu.ecep.base_app.identidad.domain.enums.UserRole;
import edu.ecep.base_app.identidad.presentation.dto.PersonaResumenDTO;
import edu.ecep.base_app.identidad.infrastructure.persistence.PersonaRepository;
import edu.ecep.base_app.shared.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.hibernate.proxy.HibernateProxy;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PersonaAccountService {

    private final PersonaRepository personaRepository;

    public PersonaResumenDTO getResumen(Long personaId) {
        return personaRepository.findById(personaId)
                .map(this::toResumen)
                .orElseThrow(() -> new NotFoundException("Persona no encontrada"));
    }

    public Persona getPersonaById(Long personaId) {
        return personaRepository.findById(personaId)
                .orElseThrow(() -> new NotFoundException("Persona no encontrada"));
    }

    public List<PersonaResumenDTO> search(String query, Long excludeId) {
        final String normalized = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
        return personaRepository.findAll().stream()
                .filter(p -> excludeId == null || !p.getId().equals(excludeId))
                .filter(p -> matches(p, normalized))
                .sorted(Comparator.comparing(Persona::getApellido, Comparator.nullsLast(String::compareToIgnoreCase))
                        .thenComparing(Persona::getNombre, Comparator.nullsLast(String::compareToIgnoreCase)))
                .map(this::toResumen)
                .collect(Collectors.toList());
    }

    private boolean matches(Persona persona, String normalizedQuery) {
        if (normalizedQuery.isEmpty()) {
            return true;
        }
        return containsIgnoreCase(persona.getEmail(), normalizedQuery)
                || containsIgnoreCase(persona.getNombre(), normalizedQuery)
                || containsIgnoreCase(persona.getApellido(), normalizedQuery)
                || containsIgnoreCase(persona.getDni(), normalizedQuery);
    }

    private boolean containsIgnoreCase(String value, String normalizedQuery) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(normalizedQuery);
    }

    public PersonaResumenDTO toResumen(Persona persona) {
        String nombre = persona.getNombre();
        String apellido = persona.getApellido();
        String nombreCompleto = buildNombreCompleto(nombre, apellido);
        Set<UserRole> roles = persona.getRoles() == null ? Set.of() : Set.copyOf(persona.getRoles());
        return new PersonaResumenDTO(
                persona.getId(),
                persona.getEmail(),
                roles,
                persona.getId(),
                nombre,
                apellido,
                nombreCompleto,
                persona.getDni(),
                resolveTipoPersona(persona)
        );
    }

    private String buildNombreCompleto(String nombre, String apellido) {
        StringBuilder sb = new StringBuilder();
        if (apellido != null && !apellido.isBlank()) {
            sb.append(apellido.trim());
        }
        if (nombre != null && !nombre.isBlank()) {
            if (sb.length() > 0) {
                sb.append(", ");
            }
            sb.append(nombre.trim());
        }
        return sb.length() == 0 ? null : sb.toString();
    }

    private String resolveTipoPersona(Persona persona) {
        if (persona == null) {
            return null;
        }
        if (persona instanceof HibernateProxy proxy) {
            return proxy.getHibernateLazyInitializer().getPersistentClass().getSimpleName();
        }
        return persona.getClass().getSimpleName();
    }

    public Persona getCurrentPersona() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        Object details = auth.getDetails();
        if (details instanceof Persona persona) {
            return persona;
        }
        try {
            Long personaId = Long.valueOf(auth.getName());
            return personaRepository.findById(personaId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
    }
}
