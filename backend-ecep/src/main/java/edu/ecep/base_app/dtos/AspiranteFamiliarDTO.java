package edu.ecep.base_app.dtos;

import lombok.Data;

/* ========== ASPIRANTE FAMILIAR ========== */
@Data
public class AspiranteFamiliarDTO {
    private Long id;
    private String tipoRelacion;
    private Boolean viveConAlumno;
    private Long aspiranteId;
    private Long familiarId;
}
