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
public class LicenciaCreateDTO {
    @NotNull
    private Long empleadoId;
    @NotBlank
    private String tipoLicencia;
    @NotNull
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    @NotBlank
    private String motivo;
    private Boolean justificada;
    private Integer horasAusencia;
    private String observaciones;
}