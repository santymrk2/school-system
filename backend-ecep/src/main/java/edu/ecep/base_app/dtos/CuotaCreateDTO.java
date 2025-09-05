package edu.ecep.base_app.dtos;

import edu.ecep.base_app.domain.enums.ConceptoCuota;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CuotaCreateDTO {
    @NotNull
    Long matriculaId;
    Long emisionId;
    @NotNull
    ConceptoCuota concepto;
    String subconcepto;
    @NotNull
    Integer anio;
    Integer mes;
    @NotNull
    BigDecimal importe;
    @NotNull
    LocalDate fechaVencimiento;
    BigDecimal porcentajeRecargo;
    @NotBlank
    String codigoPago;
    String observaciones;
}
