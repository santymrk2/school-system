package edu.ecep.base_app.dtos;

import lombok.Data;

import java.time.LocalDate;

/* ========== REGISTRO ASISTENCIA Y ASISTENCIA DÍA ========== */
@Data
public class AsistenciaDiaDTO {
    private Long id;
    private LocalDate fecha;
    private Long seccionId;
}
