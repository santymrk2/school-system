package edu.ecep.base_app.asistencias.domain;

import edu.ecep.base_app.identidad.domain.Empleado;
import edu.ecep.base_app.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "asistencia_empleados")
@Getter
@Setter
public class AsistenciaEmpleados extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Empleado empleado;

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
