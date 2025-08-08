package edu.ecep.base_app.dtos;

import lombok.Data;

/* ========== FAMILIAR ========== */
@Data
public class FamiliarDTO {
    private Long id;
    private String nombre;
    private String apellido;
    private String dni;
    private String email;
    private String telefono;
}
