package edu.ecep.base_app.dtos;

import lombok.Data;

import java.time.LocalDate;

/* ========== EVALUACIÓN ========== */
@Data
public class EvaluacionDTO {
    private Long id;
    private Long seccionId;
    private Long materiaId;
    private LocalDate fecha;
    private String tipo;
    private String descripcion;
}
