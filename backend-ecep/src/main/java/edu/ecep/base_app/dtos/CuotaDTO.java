package edu.ecep.base_app.dtos;

import edu.ecep.base_app.domain.enums.Turno;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/* ========== CUOTA Y PAGO CUOTA ========== */
@Data
public class CuotaDTO {
    private Long id;
    private String nombre;
    private BigDecimal monto;
    private LocalDate fechaEmision;
    private LocalDate fechaVencimiento;
    private String nivelAcademico;
    private Integer grado;
    private Turno turno;
    private Long seccionId;
}
