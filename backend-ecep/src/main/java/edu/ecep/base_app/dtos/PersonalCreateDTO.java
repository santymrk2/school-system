package edu.ecep.base_app.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonalCreateDTO {
    @NotBlank
    private String nombre;
    @NotBlank private String apellido;
    @NotBlank private String cuil;
    private String dni;
    private String email;
    private String telefono;
    private LocalDate fechaIngreso;
    private String cargo;

}