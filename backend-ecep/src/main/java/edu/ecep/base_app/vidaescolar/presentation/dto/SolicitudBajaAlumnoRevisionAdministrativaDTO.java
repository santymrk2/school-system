package edu.ecep.base_app.vidaescolar.presentation.dto;

import edu.ecep.base_app.vidaescolar.domain.enums.EstadoRevisionAdministrativa;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudBajaAlumnoRevisionAdministrativaDTO {
    @NotNull
    private EstadoRevisionAdministrativa estadoRevisionAdministrativa;

    @NotNull
    private Long revisadoPorPersonaId;

    private String observacionRevisionAdministrativa;
}
