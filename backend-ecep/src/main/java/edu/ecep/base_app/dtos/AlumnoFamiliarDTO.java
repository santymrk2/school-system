package edu.ecep.base_app.dtos;

import lombok.Data;

/* ========== ALUMNO FAMILIAR ========== */
@Data
public class AlumnoFamiliarDTO {
    private Long id;
    private String tipoRelacion;
    private Boolean viveConAlumno;
    private Long alumnoId;
    private Long familiarId;
}
