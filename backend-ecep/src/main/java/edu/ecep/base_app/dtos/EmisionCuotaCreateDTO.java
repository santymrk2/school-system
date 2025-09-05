package edu.ecep.base_app.dtos;

import edu.ecep.base_app.domain.enums.ConceptoCuota;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmisionCuotaCreateDTO {
    @NotNull
    Integer anio;
    Integer mes;
    @NotNull
    ConceptoCuota concepto;
    String subconcepto;
    @NotNull
    BigDecimal porcentajeRecargoDefault;
    String creadoPor;
    String criterios;
}
