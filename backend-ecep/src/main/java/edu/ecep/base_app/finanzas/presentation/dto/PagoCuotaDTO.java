package edu.ecep.base_app.finanzas.presentation.dto;

import edu.ecep.base_app.finanzas.domain.enums.EstadoPago;
import edu.ecep.base_app.finanzas.domain.enums.MedioPago;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PagoCuotaDTO {
    Long id;
    @NotNull
    Long cuotaId;
    @NotNull
    MedioPago medioPago;
    @NotNull
    EstadoPago estadoPago;
    @NotNull
    BigDecimal montoPagado;
    OffsetDateTime fechaPago;
    OffsetDateTime fechaAcreditacion;
    String referenciaExterna;
    String comprobanteArchivoId;
}
