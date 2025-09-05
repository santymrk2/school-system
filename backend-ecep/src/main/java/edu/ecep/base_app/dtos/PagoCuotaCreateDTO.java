package edu.ecep.base_app.dtos;

import edu.ecep.base_app.domain.enums.MedioPago;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PagoCuotaCreateDTO {
    @NotNull
    Long cuotaId;
    @NotNull
    MedioPago medioPago;
    @NotNull
    BigDecimal montoPagado;
    OffsetDateTime fechaPago;
    String referenciaExterna;
    String comprobanteArchivoId;
}
