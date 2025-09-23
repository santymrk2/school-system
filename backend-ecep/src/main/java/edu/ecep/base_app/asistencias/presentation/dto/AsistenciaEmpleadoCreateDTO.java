package edu.ecep.base_app.asistencias.presentation.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AsistenciaEmpleadoCreateDTO {

    @NotNull
    private Long empleadoId;

    @NotNull
    private LocalDate fecha;

    @NotBlank
    private String estado;

    private String observaciones;
}
