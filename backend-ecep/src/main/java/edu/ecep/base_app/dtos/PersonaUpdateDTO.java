package edu.ecep.base_app.dtos;

import lombok.*;
import java.time.LocalDate;
import jakarta.validation.constraints.Pattern;

@Data @NoArgsConstructor @AllArgsConstructor
public class PersonaUpdateDTO {
    String nombre;
    String apellido;
    @Pattern(regexp = "\\d{7,10}", message = "El DNI debe tener entre 7 y 10 dígitos numéricos")
    String dni;

    LocalDate fechaNacimiento;
    String genero;
    String estadoCivil;
    String nacionalidad;

    String domicilio;
    String telefono;
    String celular;
    String email;
}
