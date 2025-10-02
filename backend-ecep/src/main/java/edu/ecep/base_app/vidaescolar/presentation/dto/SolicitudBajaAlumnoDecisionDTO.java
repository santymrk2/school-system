package edu.ecep.base_app.vidaescolar.presentation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudBajaAlumnoDecisionDTO {
    @NotNull
    private Long decididoPorPersonaId;
}

