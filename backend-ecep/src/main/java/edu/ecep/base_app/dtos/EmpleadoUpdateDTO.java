package edu.ecep.base_app.dtos;

import edu.ecep.base_app.domain.enums.RolEmpleado;
import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmpleadoUpdateDTO {

    private Long personaId;

    private RolEmpleado rolEmpleado;
    private String cuil;
    // ---- Campos laborales de Empelado (opcionales en update) ----
    private String condicionLaboral;
    private String cargo;
    private String situacionActual;
    private LocalDate fechaIngreso;
    private String antecedentesLaborales;
    private String observacionesGenerales;
}
