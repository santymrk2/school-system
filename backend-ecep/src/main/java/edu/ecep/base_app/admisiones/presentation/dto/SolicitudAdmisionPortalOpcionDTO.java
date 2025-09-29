package edu.ecep.base_app.admisiones.presentation.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudAdmisionPortalOpcionDTO {
    private int indice;
    private LocalDate fecha;
    private String horario;
    private String etiqueta;
}
