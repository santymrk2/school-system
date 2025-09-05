package edu.ecep.base_app.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReciboSueldoDTO {
    Long id;
    @NotNull
    Long personalId;
    @NotNull
    Integer anio;
    @NotNull
    Integer mes;
    @NotNull
    BigDecimal bruto;
    @NotNull
    BigDecimal neto;
    boolean recibiConforme;
    OffsetDateTime fechaConfirmacion;
    String obsConfirmacion;
    String comprobanteArchivoId;
}
