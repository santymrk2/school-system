package edu.ecep.base_app.gestionacademica.presentation.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvaluacionCreateDTO {
    @NotNull
    Long seccionMateriaId;
    @NotNull
    Long trimestreId;
    @NotNull
    LocalDate fecha;
    String tema;
    @DecimalMin("0.0")
    @DecimalMax("1.0")
    BigDecimal peso;
}
