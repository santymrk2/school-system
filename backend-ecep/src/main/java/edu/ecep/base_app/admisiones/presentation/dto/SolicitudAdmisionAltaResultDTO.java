package edu.ecep.base_app.admisiones.presentation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudAdmisionAltaResultDTO {
    private Long alumnoId;
    private Long matriculaId;
    private Long seccionId;
}

