package edu.ecep.base_app.dtos;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AsistenciaPersonalDTO {
    private Long id;

    @NotNull
    private Long personalId;

    @NotNull
    private LocalDate fecha;

    /**
     * Estados sugeridos: PRESENTE | AUSENTE | TARDANZA | RETIRO_ANTICIPADO | OTRO
     * (dejado como String para no obligarte a crear un enum ahora)
     */
    @NotBlank
    private String estado;

    private String observaciones;
}
