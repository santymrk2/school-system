package edu.ecep.base_app.vidaescolar.domain;

import edu.ecep.base_app.shared.domain.BaseEntity;
import edu.ecep.base_app.vidaescolar.domain.enums.EstadoSolicitudBaja;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;

import java.time.OffsetDateTime;

@Entity @Table(name="bajas_alumnos")
@SQLDelete(sql = "UPDATE bajas_alumnos SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter @Setter
public class SolicitudBajaAlumno extends BaseEntity {
    @ManyToOne(optional=false, fetch= FetchType.LAZY) private Matricula matricula;

    @Enumerated(EnumType.STRING) @Column(nullable=false)
    private EstadoSolicitudBaja estado = EstadoSolicitudBaja.PENDIENTE;

    private String motivo;
    private String motivoRechazo; // obligatorio si RECHAZADA
    private OffsetDateTime fechaDecision;
    private Long decididoPorPersonaId;
}