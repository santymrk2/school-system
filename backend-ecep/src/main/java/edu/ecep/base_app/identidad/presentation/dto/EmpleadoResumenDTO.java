package edu.ecep.base_app.identidad.presentation.dto;

public record EmpleadoResumenDTO(
        Long id,
        Long personaId,
        String nombre,
        String apellido,
        String nombreCompleto,
        String cargo,
        String legajo
) {
}
