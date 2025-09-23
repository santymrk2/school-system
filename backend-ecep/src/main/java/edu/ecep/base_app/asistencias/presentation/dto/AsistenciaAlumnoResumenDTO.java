package edu.ecep.base_app.asistencias.presentation.dto;


import lombok.*;


@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AsistenciaAlumnoResumenDTO {
    private Long matriculaId;
    private Long alumnoId;
    private String nombreCompleto;
    private int presentes;
    private int ausentes;
    private int tarde;
    private int retiroAnticipado;
    private int total;
    private double porcentaje; // lo completa el service

    // Constructor para JPQL con nombre y apellido separados
    public AsistenciaAlumnoResumenDTO(Long matriculaId,
                                      Long alumnoId,
                                      String apellido,
                                      String nombre,
                                      Long presentes,
                                      Long ausentes,
                                      Long tarde,
                                      Long retiroAnticipado,
                                      Long total) {
        this.matriculaId = matriculaId;
        this.alumnoId = alumnoId;
        String ap = (apellido == null ? "" : apellido);
        String no = (nombre == null ? "" : nombre);
        this.nombreCompleto = (ap + " " + no).trim();
        this.presentes = safe(presentes);
        this.ausentes = safe(ausentes);
        this.tarde = safe(tarde);
        this.retiroAnticipado = safe(retiroAnticipado);
        this.total = safe(total);
        this.porcentaje = 0d;
    }

    private static int safe(Long v) { return v == null ? 0 : v.intValue(); }
}
