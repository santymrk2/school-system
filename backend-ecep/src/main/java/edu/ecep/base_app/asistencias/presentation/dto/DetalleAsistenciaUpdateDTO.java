package edu.ecep.base_app.asistencias.presentation.dto;

import edu.ecep.base_app.asistencias.domain.enums.EstadoAsistencia;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetalleAsistenciaUpdateDTO {
    @NotNull
    private EstadoAsistencia estado;
    private String observacion;
}
