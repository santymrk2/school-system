package edu.ecep.base_app.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatriculaSeccionHistorialDTO {
    Long id;
    @NotNull
    Long matriculaId;
    @NotNull
    Long seccionId;
    @NotNull
    LocalDate desde;
    LocalDate hasta;
}
