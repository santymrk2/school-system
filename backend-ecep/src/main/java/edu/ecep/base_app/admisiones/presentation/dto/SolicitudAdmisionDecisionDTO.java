package edu.ecep.base_app.admisiones.presentation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudAdmisionDecisionDTO {
    private boolean aceptar;
    private String mensaje;
}
