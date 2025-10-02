package edu.ecep.base_app.comunicacion.presentation.dto;

import java.time.OffsetDateTime;

public record ComunicadoLecturaResumenDTO(
        Long comunicadoId,
        long totalDestinatarios,
        long confirmadas,
        long pendientes,
        OffsetDateTime ultimaLectura,
        boolean confirmadoPorMi,
        OffsetDateTime miFechaLectura
) {
}
