package edu.ecep.base_app.dtos;

import lombok.Data;

import java.time.LocalDate;

/* ========== INFORME INICIAL ========== */
@Data
public class InformeInicialDTO {
    private Long id;
    private String trimestre;
    private LocalDate fecha;
    private String contenido;
    private Long matriculaId;
    private Long reportadoPorId;
}
