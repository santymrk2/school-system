package edu.ecep.base_app.dtos;

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
