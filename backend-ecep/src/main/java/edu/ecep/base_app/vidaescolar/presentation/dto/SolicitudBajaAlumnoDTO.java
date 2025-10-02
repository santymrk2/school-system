package edu.ecep.base_app.vidaescolar.presentation.dto;

import edu.ecep.base_app.vidaescolar.domain.enums.EstadoSolicitudBaja;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudBajaAlumnoDTO {
    Long id;
    @NotNull
    Long matriculaId;
    Long alumnoId;
    @NotNull
    EstadoSolicitudBaja estado;
    String motivo;
    String motivoRechazo;
    OffsetDateTime fechaDecision;
    Long decididoPorPersonaId;
    String alumnoNombre;
    String alumnoApellido;
    String alumnoDni;
    Long periodoEscolarId;
}
