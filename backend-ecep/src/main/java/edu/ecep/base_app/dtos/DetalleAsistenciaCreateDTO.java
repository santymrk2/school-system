package edu.ecep.base_app.dtos;

import edu.ecep.base_app.domain.enums.EstadoAsistencia;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class DetalleAsistenciaCreateDTO {
    Long jornadaId;
    Long matriculaId;
    EstadoAsistencia estado;
    String observacion;
}
