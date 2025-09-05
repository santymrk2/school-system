package edu.ecep.base_app.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JornadaAsistenciaCreateDTO {
    @NotNull
    Long seccionId;
    @NotNull
    Long trimestreId;
    @NotNull
    LocalDate fecha;
}
