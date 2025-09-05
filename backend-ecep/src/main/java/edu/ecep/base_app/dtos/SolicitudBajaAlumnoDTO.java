package edu.ecep.base_app.dtos;

import edu.ecep.base_app.domain.enums.EstadoSolicitudBaja;
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
    @NotNull
    EstadoSolicitudBaja estado;
    String motivo;
    String motivoRechazo;
    OffsetDateTime fechaDecision;
    Long decididoPor;
}
