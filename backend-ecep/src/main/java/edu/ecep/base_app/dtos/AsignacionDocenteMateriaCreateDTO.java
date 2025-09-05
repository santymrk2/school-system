package edu.ecep.base_app.dtos;

import edu.ecep.base_app.domain.enums.RolMateria;
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
    Long personalId;
    @NotNull
    RolMateria rol;
    @NotNull
    LocalDate vigenciaDesde;
    LocalDate vigenciaHasta;
}
