package edu.ecep.base_app.dtos;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor
public class PersonaCreateDTO {
    @NotBlank String nombre;
    @NotBlank String apellido;
    @NotBlank String dni;

    LocalDate fechaNacimiento;
    String genero;
    String estadoCivil;
    String nacionalidad;

    String domicilio;
    String telefono;
    String celular;
    @Email String email;
}
