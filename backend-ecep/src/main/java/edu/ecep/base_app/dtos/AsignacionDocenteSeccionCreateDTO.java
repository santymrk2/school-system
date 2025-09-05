package edu.ecep.base_app.dtos;

import edu.ecep.base_app.domain.enums.RolSeccion;
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
    Long personalId;
    @NotNull
    RolSeccion rol;
    @NotNull
    LocalDate vigenciaDesde;
    LocalDate vigenciaHasta;
}
