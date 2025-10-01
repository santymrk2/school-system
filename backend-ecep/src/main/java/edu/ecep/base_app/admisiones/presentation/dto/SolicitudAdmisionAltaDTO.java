package edu.ecep.base_app.admisiones.presentation.dto;

import edu.ecep.base_app.shared.domain.enums.Turno;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudAdmisionAltaDTO {
    private Long seccionId;
    private Turno turno;
    private Long periodoEscolarId;
    private Boolean autoAsignarSiguientePeriodo;
}

