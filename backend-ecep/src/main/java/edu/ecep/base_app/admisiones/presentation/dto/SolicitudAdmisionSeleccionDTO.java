package edu.ecep.base_app.admisiones.presentation.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudAdmisionSeleccionDTO {
    @NotNull
    private LocalDate fechaSeleccionada;
}
