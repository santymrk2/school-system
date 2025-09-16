package edu.ecep.base_app.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor
public class FormacionAcademicaDTO {
    private Long id;
    @NotNull
    private Long empleadoId;    // <- agregado (FK)
    @NotBlank
    private String nivel;
    @NotBlank private String institucion;
    @NotBlank private String tituloObtenido;
    @NotNull private LocalDate fechaInicio;
    private LocalDate fechaFin;
}