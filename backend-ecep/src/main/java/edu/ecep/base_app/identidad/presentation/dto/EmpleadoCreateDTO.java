package edu.ecep.base_app.identidad.presentation.dto;

import edu.ecep.base_app.identidad.domain.enums.RolEmpleado;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmpleadoCreateDTO {

    private Long personaId;

    private RolEmpleado rolEmpleado;
    private String cuil;
    private String legajo;
    private String condicionLaboral;
    private String cargo;
    private String situacionActual;
    private LocalDate fechaIngreso;
    private String antecedentesLaborales;
    private String observacionesGenerales;
}
