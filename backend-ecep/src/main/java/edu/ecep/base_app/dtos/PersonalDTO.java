package edu.ecep.base_app.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonalDTO {
    Long id;
    String nombre; String apellido; String dni;
    LocalDate fechaNacimiento;
    String genero; String domicilio; String telefono; String email;
    String cuil; LocalDate fechaIngreso;
    String condicionLaboral; String cargo; String situacionActual;
    String antecedentesLaborales; String observacionesGenerales;
}