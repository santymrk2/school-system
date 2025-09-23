package edu.ecep.base_app.identidad.presentation.dto;

import edu.ecep.base_app.identidad.domain.enums.UserRole;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonaUpdateDTO {
    private String nombre;
    private String apellido;
    @Pattern(regexp = "\\d{7,10}", message = "El DNI debe tener entre 7 y 10 dígitos numéricos")
    private String dni;

    private LocalDate fechaNacimiento;
    private String genero;
    private String estadoCivil;
    private String nacionalidad;

    private String domicilio;
    private String telefono;
    private String celular;
    private String email;
    private String password;
    private Set<UserRole> roles;
}
