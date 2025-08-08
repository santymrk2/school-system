package edu.ecep.base_app.dtos;

import lombok.Data;

import java.time.LocalDate;

/* ========== ASIGNACIÓN DOCENTE ========== */
@Data
public class AsignacionDocenteDTO {
    private Long id;
    private Boolean esTitular;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String observaciones;
    private Long personalId;
    private Long seccionId;
    private Long materiaId;
}
