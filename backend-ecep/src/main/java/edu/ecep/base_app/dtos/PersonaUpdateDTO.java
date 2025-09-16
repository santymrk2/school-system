package edu.ecep.base_app.dtos;

import lombok.*;
import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor
public class PersonaUpdateDTO {
    String nombre;
    String apellido;
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
