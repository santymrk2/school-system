package edu.ecep.base_app.dtos;

import lombok.Data;

import java.time.LocalDate;

/* ========== ALUMNO ========== */
@Data
public class AlumnoDTO {
    private Long id;
    private String nombre;
    private String apellido;
    private String dni;
    private LocalDate fechaInscripcion;
    private String observacionesGenerales;
    private String motivoRechazoBaja;
}
