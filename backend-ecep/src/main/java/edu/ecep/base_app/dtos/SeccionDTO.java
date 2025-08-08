package edu.ecep.base_app.dtos;

import edu.ecep.base_app.domain.enums.Turno;
import lombok.Data;

import java.util.Set;

/* ========== SECCIÓN ========== */
@Data
public class SeccionDTO {
    private Long id;
    private Integer anioLectivo;
    private String nombre;
    private String nivelAcademico;
    private Integer grado;
    private Turno turno;
    private Set<Long> cuotasIds;
}