package edu.ecep.base_app.admisiones.presentation.dto;

import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudAdmisionPortalDTO {
    private Long solicitudId;
    private String aspirante;
    private String correoReferencia;
    private String disponibilidadCurso;
    private Boolean cupoDisponible;
    private List<SolicitudAdmisionPortalOpcionDTO> opciones;
    private boolean permiteSolicitarReprogramacion;
    private boolean reprogramacionSolicitada;
    private boolean respuestaRegistrada;
    private LocalDate fechaSeleccionada;
    private String horarioSeleccionado;
    private Integer opcionSeleccionada;
    private String aclaracionesDireccion;
    private String documentosRequeridos;
    private List<String> adjuntosInformativos;
    private LocalDate fechaLimiteRespuesta;
    private String notasDireccion;
}
