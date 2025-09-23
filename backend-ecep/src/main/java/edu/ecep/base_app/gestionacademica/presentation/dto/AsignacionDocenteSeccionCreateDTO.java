package edu.ecep.base_app.gestionacademica.presentation.dto;

import edu.ecep.base_app.gestionacademica.domain.enums.RolSeccion;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AsignacionDocenteSeccionCreateDTO {
    @NotNull
    Long seccionId;
    @NotNull
    Long empleadoId;
    @NotNull
    RolSeccion rol;
    @NotNull
    LocalDate vigenciaDesde;
    LocalDate vigenciaHasta;
}
