package edu.ecep.base_app.vidaescolar.presentation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class SolicitudBajaAlumnoRechazoDTO extends SolicitudBajaAlumnoDecisionDTO {
    @NotBlank
    private String motivoRechazo;
}

