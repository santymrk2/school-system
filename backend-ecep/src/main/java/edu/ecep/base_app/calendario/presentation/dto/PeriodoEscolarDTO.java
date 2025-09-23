package edu.ecep.base_app.calendario.presentation.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// =============================================================
// 1) Calendario académico
// =============================================================
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PeriodoEscolarDTO {
    Long id;
    @NotNull
    @Min(2000)
    Integer anio;
}
