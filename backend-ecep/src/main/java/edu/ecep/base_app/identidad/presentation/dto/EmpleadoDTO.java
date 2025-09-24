package edu.ecep.base_app.identidad.presentation.dto;

import edu.ecep.base_app.identidad.domain.enums.RolEmpleado;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmpleadoDTO {
    Long id;
    @NotNull
    Long personaId;

    @NotNull
    private RolEmpleado rolEmpleado;
    private String cuil;
    private String legajo;
    private LocalDate fechaIngreso;
    private String condicionLaboral;
    private String cargo;
    private String situacionActual;
    private String antecedentesLaborales;
    private String observacionesGenerales;

}