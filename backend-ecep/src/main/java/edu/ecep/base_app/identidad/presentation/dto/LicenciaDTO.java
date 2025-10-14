package edu.ecep.base_app.identidad.presentation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LicenciaDTO {
    private Long id;
    @NotNull
    private Long empleadoId;
    private EmpleadoResumenDTO empleado;
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
