package edu.ecep.base_app.identidad.presentation.dto;

import edu.ecep.base_app.identidad.domain.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonaCreateDTO {
    @NotBlank
    private String nombre;
    @NotBlank
    private String apellido;
    @NotBlank
    @Pattern(regexp = "\\d{7,10}", message = "El DNI debe tener entre 7 y 10 dígitos numéricos")
    private String dni;

    private LocalDate fechaNacimiento;
    private String genero;
    private String estadoCivil;
    private String nacionalidad;

    private String domicilio;
    private String telefono;
    private String celular;
    @Email
    private String email;
    private String password;
    private Set<UserRole> roles;
}
