package edu.ecep.base_app.gestionacademica.presentation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalificacionTrimestralCreateDTO {
    @NotNull
    Long trimestreId;
    @NotNull
    Long seccionMateriaId;
    @NotNull
    Long matriculaId;
    Double notaNumerica;
    String notaConceptual;
    String observaciones;
}
