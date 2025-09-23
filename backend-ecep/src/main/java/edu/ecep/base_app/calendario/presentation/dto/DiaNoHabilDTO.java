package edu.ecep.base_app.calendario.presentation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiaNoHabilDTO {
    Long id;
    @NotNull
    LocalDate fecha;
    @NotBlank
    String motivo;
}
