package edu.ecep.base_app.dtos.asistencia;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AsistenciaAcumuladoDTO {
    private LocalDate desde;
    private LocalDate hasta;
    private int presentes;
    private int ausentes;
    private int tarde;
    private int retiroAnticipado;
    private int total;
    private double porcentaje; // lo completa el service

    // Constructor para JPQL con sólo los contadores
    public AsistenciaAcumuladoDTO(Long presentes,
                                  Long ausentes,
                                  Long tarde,
                                  Long retiroAnticipado,
                                  Long total) {
        this.presentes = safe(presentes);
        this.ausentes = safe(ausentes);
        this.tarde = safe(tarde);
        this.retiroAnticipado = safe(retiroAnticipado);
        this.total = safe(total);
        this.porcentaje = 0d;
    }

    private static int safe(Long v) { return v == null ? 0 : v.intValue(); }
}
