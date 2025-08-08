package edu.ecep.base_app.dtos;

import lombok.Data;

import java.time.LocalDate;

/* ========== MATRÍCULA ========== */
@Data
public class MatriculaDTO {
    private Long id;
    private Integer anioLectivo;
    private String estado;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Long alumnoId;
    private Long seccionId;
}
