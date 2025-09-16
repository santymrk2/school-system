package edu.ecep.base_app.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data@NoArgsConstructor
@AllArgsConstructor @Builder
public class PersonaDTO {
    Long id;
    @NotBlank String nombre;
    @NotBlank String apellido;
    @NotBlank
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