package edu.ecep.base_app.finanzas.presentation.dto;

import edu.ecep.base_app.finanzas.domain.enums.ConceptoCuota;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CuotaBulkCreateDTO {
    @NotEmpty
    private List<Long> seccionIds;

    private ConceptoCuota concepto;
    private String subconcepto;
    private Integer anio;
    private Integer mes;

    @NotNull
    private BigDecimal importe;

    @NotNull
    private LocalDate fechaVencimiento;

    private BigDecimal porcentajeRecargo;
    private String observaciones;

    private boolean matricula;
}
