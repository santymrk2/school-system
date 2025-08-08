package edu.ecep.base_app.dtos;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PagoCuotaDTO {
    private Long id;
    private LocalDate fechaPago;
    private BigDecimal montoPagado;
    private String medioPago;
    private Long cuotaId;
    private Long matriculaId;
}
