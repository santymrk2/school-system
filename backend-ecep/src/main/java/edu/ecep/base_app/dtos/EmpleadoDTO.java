package edu.ecep.base_app.dtos;

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

    private String cuil;
    private LocalDate fechaIngreso;
    private String condicionLaboral;
    private String cargo;
    private String situacionActual;
    private String antecedentesLaborales;
    private String observacionesGenerales;

}