package edu.ecep.base_app.dtos;


import jakarta.validation.constraints.*;
import java.time.LocalDate;
import edu.ecep.base_app.domain.enums.EstadoActaAccidente;


public record ActaAccidenteUpdateDTO(
        @NotNull LocalDate fechaSuceso,
        @NotBlank String descripcion,
        @NotNull EstadoActaAccidente estado,
        String creadoPor // opcional: para registrar “último editor” sencillo
) {}