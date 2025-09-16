package edu.ecep.base_app.dtos;

import edu.ecep.base_app.domain.enums.EstadoAsistencia;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetalleAsistenciaDTO {
    Long id;
    @NotNull
    Long jornadaId;
    @NotNull
    Long matriculaId;
    @NotNull
    EstadoAsistencia estado;
    String observacion;
}
