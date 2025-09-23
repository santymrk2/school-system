package edu.ecep.base_app.gestionacademica.presentation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResultadoEvaluacionDTO {
    Long id;
    @NotNull
    Long evaluacionId;
    @NotNull
    Long matriculaId;
    Double notaNumerica;
    String notaConceptual;
    String observaciones;
}
