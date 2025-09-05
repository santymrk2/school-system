package edu.ecep.base_app.dtos;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AsistenciaPersonalCreateDTO {

    @NotNull
    private Long personalId;

    @NotNull
    private LocalDate fecha;

    @NotBlank
    private String estado;

    private String observaciones;
}
