package edu.ecep.base_app.dtos;

import lombok.Data;

import java.time.LocalDate;

/* ========== PERSONAL ========== */
@Data
public class PersonalDTO {
    private Long id;
    private String nombre;
    private String apellido;
    private String dni;
    private LocalDate fechaIngreso;
    private String condicionLaboral;
    private String cargo;
    private String situacionActual;
}
