package edu.ecep.base_app.admisiones.presentation.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudAdmisionDTO {
    private Long id;
    private Long aspiranteId;
    private AspiranteDTO aspirante;
    private OffsetDateTime fechaSolicitud;
    private String estado;
    private String observaciones;

    private String disponibilidadCurso;
    private Boolean cupoDisponible;

    private List<LocalDate> fechasPropuestas;
    private List<String> rangosHorariosPropuestos;
    private String aclaracionesPropuesta;
    private LocalDate fechaLimiteRespuesta;
    private LocalDate fechaRespuestaFamilia;
    private LocalDate fechaEntrevistaConfirmada;
    private String horarioEntrevistaConfirmado;
    private Integer opcionEntrevistaSeleccionada;

    private Boolean entrevistaRealizada;
    private Boolean emailConfirmacionEnviado;

    private String documentosRequeridos;
    private List<String> adjuntosInformativos;
    private String notasDireccion;
    private String comentariosEntrevista;
    private String motivoRechazo;
    private Boolean puedeSolicitarReprogramacion;
    private Boolean reprogramacionSolicitada;
    private String comentarioReprogramacion;
    private Integer cantidadPropuestasEnviadas;

    private Long alumnoId;
    private Long matriculaId;
    private Boolean altaGenerada;
}
