package edu.ecep.base_app.dtos;

import edu.ecep.base_app.domain.enums.EstadoActaAccidente;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

// =============================================================
// 8) Actas de accidente (SIN presentes linkeados; informante obligatorio)
// =============================================================
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActaAccidenteDTO {
    Long id;
    @NotNull
    Long alumnoId;
    @NotNull
    LocalDate fechaSuceso;
    @NotBlank
    String descripcion;
    @NotNull
    EstadoActaAccidente estado;
    String creadoPor;
    @NotNull
    Long informanteId;
}
