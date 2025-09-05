package edu.ecep.base_app.dtos;

import edu.ecep.base_app.domain.enums.ConceptoCuota;
import edu.ecep.base_app.domain.enums.EstadoCuota;
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
public class CuotaDTO {
    Long id;
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
    @NotNull
    BigDecimal porcentajeRecargo;
    @NotNull
    EstadoCuota estado;
    @NotBlank
    String codigoPago;
    String observaciones;
}
