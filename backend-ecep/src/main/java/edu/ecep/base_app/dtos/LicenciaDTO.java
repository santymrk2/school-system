package edu.ecep.base_app.dtos;

import lombok.Data;

import java.time.LocalDate;

/* ========== LICENCIA ========== */
@Data
public class LicenciaDTO {
    private Long id;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String tipoLicencia;
    private Long personalId;
}
