package edu.ecep.base_app.dtos;

import lombok.Data;

import java.time.LocalDate;

/* ========== ASISTENCIA PERSONAL ========== */
@Data
public class AsistenciaPersonalDTO {
    private Long id;
    private Long personalId;
    private LocalDate fecha;
    private Boolean presente;
}
