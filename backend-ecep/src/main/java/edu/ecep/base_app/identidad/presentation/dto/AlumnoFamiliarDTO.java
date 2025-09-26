package edu.ecep.base_app.identidad.presentation.dto;

import edu.ecep.base_app.shared.domain.enums.RolVinculo;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlumnoFamiliarDTO {
    Long id;
    @NotNull
    Long alumnoId;
    @NotNull
    Long familiarId;
    @NotBlank
    @Enumerated(EnumType.STRING)
    RolVinculo rolVinculo;
    boolean convive;
}
