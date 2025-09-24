package edu.ecep.base_app.identidad.presentation.dto;

import edu.ecep.base_app.identidad.domain.enums.UserRole;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonaDTO {
    private Long id;
    @NotBlank
    private String nombre;
    @NotBlank
    private String apellido;
    @NotBlank
    private String dni;

    private LocalDate fechaNacimiento;
    private String genero;
    private String estadoCivil;
    private String nacionalidad;

    private String domicilio;
    private String telefono;
    private String celular;
    private String email;
    private String fotoPerfilUrl;
    private Set<UserRole> roles;
    private boolean credencialesActivas;
}
