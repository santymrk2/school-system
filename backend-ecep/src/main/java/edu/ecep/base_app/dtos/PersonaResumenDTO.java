package edu.ecep.base_app.dtos;

import edu.ecep.base_app.domain.enums.UserRole;

import java.util.Set;

public record PersonaResumenDTO(
        Long id,
        String email,
        Set<UserRole> roles,
        Long personaId,
        String nombre,
        String apellido,
        String nombreCompleto,
        String dni,
        String tipoPersona
) {
}
