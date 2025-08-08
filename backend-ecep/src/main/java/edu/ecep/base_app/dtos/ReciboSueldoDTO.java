package edu.ecep.base_app.dtos;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/* ========== RECIBO SUELDO ========== */
@Data
public class ReciboSueldoDTO {
    private Long id;
    private LocalDate fecha;
    private BigDecimal monto;
    private Long personalId;
}
