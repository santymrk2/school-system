package edu.ecep.base_app.identidad.presentation.dto;

import edu.ecep.base_app.identidad.domain.Persona;
import edu.ecep.base_app.identidad.domain.enums.UserRole;
import lombok.Getter;

import java.util.Set;

@Getter
public class AuthResponse {
    private final String token;
    private final Long personaId;
    private final String email;
    private final Set<UserRole> roles;
    private final String nombre;
    private final String apellido;
    private final String nombreCompleto;

    public AuthResponse(String token, Long personaId, String email, Set<UserRole> roles,
                        String nombre, String apellido, String nombreCompleto) {
        this.token = token;
        this.personaId = personaId;
        this.email = email;
        this.roles = roles;
        this.nombre = nombre;
        this.apellido = apellido;
        this.nombreCompleto = nombreCompleto;
    }

    public static AuthResponse fromPersona(String token, Persona persona) {
        String nombreCompleto = buildNombreCompleto(persona.getNombre(), persona.getApellido());
        Set<UserRole> roles = persona.getRoles() == null ? Set.of() : persona.getRoles();
        return new AuthResponse(
                token,
                persona.getId(),
                persona.getEmail(),
                roles,
                persona.getNombre(),
                persona.getApellido(),
                nombreCompleto
        );
    }

    private static String buildNombreCompleto(String nombre, String apellido) {
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
}
