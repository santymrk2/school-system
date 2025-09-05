package edu.ecep.base_app.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActaAccidenteCreateDTO {
    @NotNull
    Long alumnoId;
    @NotNull
    LocalDate fechaSuceso;
    @NotBlank
    String descripcion;
    @NotNull
    Long informanteId;
    String creadoPor;
}
