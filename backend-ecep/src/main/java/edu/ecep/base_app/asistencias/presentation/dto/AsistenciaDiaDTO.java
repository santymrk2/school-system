package edu.ecep.base_app.asistencias.presentation.dto;

import java.time.LocalDate;
import lombok.*;


@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AsistenciaDiaDTO {
    private LocalDate fecha;
    private int presentes;
    private int ausentes;
    private int tarde;
    private int retiroAnticipado;
    private int total;
    private double porcentaje; // lo completa el service

    // Constructor específico para JPQL (Longs -> int, porcentaje 0)
    public AsistenciaDiaDTO(LocalDate fecha,
                            Long presentes,
                            Long ausentes,
                            Long tarde,
                            Long retiroAnticipado,
                            Long total) {
        this.fecha = fecha;
        this.presentes = safe(presentes);
        this.ausentes = safe(ausentes);
        this.tarde = safe(tarde);
        this.retiroAnticipado = safe(retiroAnticipado);
        this.total = safe(total);
        this.porcentaje = 0d;
    }

    private static int safe(Long v) { return v == null ? 0 : v.intValue(); }
}
