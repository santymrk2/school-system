package edu.ecep.base_app.dtos;

import lombok.Data;

import java.time.LocalDate;

/* ========== SOLICITUD ADMISIÓN ========== */
@Data
public class SolicitudAdmisionDTO {
    private Long id;
    private String estado;
    private String motivoRechazo;
    private LocalDate fechaEntrevista;
    private Boolean entrevistaRealizada;
    private Boolean emailConfirmacionEnviado;
    private Boolean autorizadoComunicacionesEmail;
    private Long aspiranteId;
}
