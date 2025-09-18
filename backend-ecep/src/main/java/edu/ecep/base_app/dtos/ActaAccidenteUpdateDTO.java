package edu.ecep.base_app.dtos;


import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalTime;
import edu.ecep.base_app.domain.enums.EstadoActaAccidente;


public record ActaAccidenteUpdateDTO(
        @NotNull LocalDate fechaSuceso,
        @NotNull LocalTime horaSuceso,
        @NotBlank String lugar,
        @NotBlank String descripcion,
        @NotBlank String acciones,
        @NotNull EstadoActaAccidente estado,
        Long firmanteId,
        String creadoPor // opcional: para registrar “último editor” sencillo
) {}
