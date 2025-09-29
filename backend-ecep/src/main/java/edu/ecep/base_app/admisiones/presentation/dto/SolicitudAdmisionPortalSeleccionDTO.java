package edu.ecep.base_app.admisiones.presentation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudAdmisionPortalSeleccionDTO {
    @NotNull
    private Respuesta opcion;
    private String comentario;

    public enum Respuesta {
        OPCION_1,
        OPCION_2,
        OPCION_3,
        NO_DISPONIBLE
    }
}
