package edu.ecep.base_app.finanzas.presentation.dto;

import edu.ecep.base_app.finanzas.domain.enums.EstadoPago;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PagoCuotaEstadoUpdateDTO {
    @NotNull
    EstadoPago estadoPago;
    OffsetDateTime fechaAcreditacion;
}
