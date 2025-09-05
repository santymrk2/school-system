package edu.ecep.base_app.dtos;

import edu.ecep.base_app.domain.enums.NivelAcademico;
import edu.ecep.base_app.domain.enums.Turno;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// =============================================================
// 2) Estructura académica (plan + docencia)
// =============================================================
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeccionDTO {
    Long id;
    @NotNull
    Long periodoEscolarId;
    @NotNull
    NivelAcademico nivel;
    @NotBlank
    String gradoSala;
    @NotBlank
    String division;
    @NotNull
    Turno turno;
}
