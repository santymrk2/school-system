package edu.ecep.base_app.dtos;

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
public class SolicitudAdmisionDTO {
    private Long id;
    private Long aspiranteId;
    private AspiranteDTO aspirante;
    private String estado;
    private String observaciones;

    private String disponibilidadCurso;
    private Boolean cupoDisponible;

    private List<LocalDate> fechasPropuestas;
    private LocalDate fechaLimiteRespuesta;
    private LocalDate fechaRespuestaFamilia;
    private LocalDate fechaEntrevistaConfirmada;

    private Boolean entrevistaRealizada;
    private Boolean emailConfirmacionEnviado;

    private String documentosRequeridos;
    private List<String> adjuntosInformativos;
    private String notasDireccion;
    private String motivoRechazo;
}
