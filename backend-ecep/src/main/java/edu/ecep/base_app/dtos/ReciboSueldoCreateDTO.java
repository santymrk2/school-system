package edu.ecep.base_app.dtos;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReciboSueldoCreateDTO {
    @NotNull
    Long personalId;
    @NotNull
    Integer anio;
    @NotNull
    @Min(1)
    @Max(12)
    Integer mes;
    @NotNull
    BigDecimal bruto;
    @NotNull
    BigDecimal neto;
    String comprobanteArchivoId;
}
