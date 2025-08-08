package edu.ecep.base_app.dtos;

import lombok.Data;

/* ========== CALIFICACIÓN ========== */
@Data
public class CalificacionDTO {
    private Long id;
    private Long matriculaId;
    private Long evaluacionId;
    private String valor;
    private String observaciones;
}
