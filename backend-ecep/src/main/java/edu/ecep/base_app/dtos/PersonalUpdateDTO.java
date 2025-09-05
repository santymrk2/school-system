package edu.ecep.base_app.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonalUpdateDTO {
    private String nombre;
    private String apellido;
    private String cuil;
    private String dni;
    private String email;
    private String telefono;
    private LocalDate fechaIngreso;
    private String cargo;
}