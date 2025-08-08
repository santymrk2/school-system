package edu.ecep.base_app.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "asistencia_personal")
@Getter
@Setter
public class AsistenciaPersonal extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Personal personal;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column
    private LocalTime horaEntrada;

    @Column
    private LocalTime horaSalida;

    private Boolean falta;
    private Boolean justificada;
    private String motivo;
}