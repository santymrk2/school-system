package edu.ecep.base_app.asistencias.presentation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JornadaAsistenciaCreateDTO {
    @NotNull
    Long seccionId;
    @NotNull
    Long trimestreId;
    @NotNull
    LocalDate fecha;
}
