package edu.ecep.base_app.dtos;

import lombok.Data;

import java.time.LocalDate;

/* ========== DÍA NO HÁBIL ========== */
@Data
public class DiaNoHabilDTO {
    private Long id;
    private LocalDate fecha;
    private String descripcion;
}
