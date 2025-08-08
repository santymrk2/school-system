package edu.ecep.base_app.dtos;

import lombok.Data;

import java.time.LocalDate;

/* ========== FORMACION ACADEMICA ========== */
@Data
public class FormacionAcademicaDTO {
    private Long id;
    private String nivel;
    private String institucion;
    private String titulo;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
}
