package edu.ecep.base_app.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlumnoDTO {
    Long id;
    @NotNull
    Long personaId;

    LocalDate fechaInscripcion;
    String observacionesGenerales;
    String motivoRechazoBaja;

}
