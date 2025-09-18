package edu.ecep.base_app.dtos;

import java.util.List;

public record DireccionConfiguracionDTO(
        PeriodoEscolarDTO periodoActual,
        List<TrimestreDTO> trimestres
) {
}
