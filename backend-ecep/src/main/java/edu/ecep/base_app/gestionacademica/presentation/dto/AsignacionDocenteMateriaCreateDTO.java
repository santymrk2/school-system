package edu.ecep.base_app.gestionacademica.presentation.dto;

import edu.ecep.base_app.gestionacademica.domain.enums.RolMateria;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AsignacionDocenteMateriaCreateDTO {
    @NotNull
    Long seccionMateriaId;
    @NotNull
    Long empleadoId;
    @NotNull
    RolMateria rol;
    LocalDate vigenciaDesde;
    LocalDate vigenciaHasta;
}
