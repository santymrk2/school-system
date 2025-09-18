package edu.ecep.base_app.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

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
    @NotBlank
    String lugar;
    @NotNull
    LocalTime horaSuceso;
    @NotBlank
    String acciones;
    @NotNull
    Long informanteId;
    Long firmanteId;
    String creadoPor;
}
