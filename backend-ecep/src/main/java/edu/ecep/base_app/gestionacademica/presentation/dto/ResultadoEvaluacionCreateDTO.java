package edu.ecep.base_app.gestionacademica.presentation.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResultadoEvaluacionCreateDTO {
    @NotNull
    Long evaluacionId;
    @NotNull
    Long matriculaId;
    @DecimalMin(value = "1.0", inclusive = true, message = "La nota debe ser al menos 1")
    @DecimalMax(value = "10.0", inclusive = true, message = "La nota no puede superar 10")
    Double notaNumerica;
    String notaConceptual;
    String observaciones;
}
