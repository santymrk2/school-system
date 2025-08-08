package edu.ecep.base_app.dtos;

import lombok.Data;

import java.time.OffsetDateTime;

/* ========== ACTA ACCIDENTE ========== */
@Data
public class ActaAccidenteDTO {
    private Long id;
    private OffsetDateTime fechaAccidente;
    private String lugar;
    private String descripcion;
    private String accionesTomadas;
    private Long matriculaId;
}
