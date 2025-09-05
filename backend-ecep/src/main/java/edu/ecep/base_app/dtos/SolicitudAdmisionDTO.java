package edu.ecep.base_app.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudAdmisionDTO {
    Long id;
    Long aspiranteId;
    String estado;
    String observaciones;
}
