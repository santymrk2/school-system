package edu.ecep.base_app.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PeriodoEscolarCreateDTO {
    @NotNull
    @Min(2000)
    Integer anio;
}
