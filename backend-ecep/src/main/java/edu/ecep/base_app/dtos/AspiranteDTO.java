package edu.ecep.base_app.dtos;

import lombok.Data;

/* ========== ASPIRANTE ========== */
@Data
public class AspiranteDTO {
    private Long id;
    private String nombre;
    private String apellido;
    private String dni;
    private String escuelaActual;
    private String conectividadInternet;
    private String dispositivosDisponibles;
    private String idiomasHabladosHogar;
}
