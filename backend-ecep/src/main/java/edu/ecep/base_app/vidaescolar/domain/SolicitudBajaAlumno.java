package edu.ecep.base_app.vidaescolar.domain;

import edu.ecep.base_app.shared.domain.BaseEntity;
import edu.ecep.base_app.vidaescolar.domain.enums.EstadoRevisionAdministrativa;
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

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private EstadoSolicitudBaja estado = EstadoSolicitudBaja.PENDIENTE;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_revision_administrativa", nullable = false)
    private EstadoRevisionAdministrativa estadoRevisionAdministrativa = EstadoRevisionAdministrativa.PENDIENTE;

    @Column(name = "fecha_revision_administrativa")
    private OffsetDateTime fechaRevisionAdministrativa;

    @Column(name = "revisado_administrativamente_por_persona_id")
    private Long revisadoAdministrativamentePorPersonaId;

    @Column(name = "observacion_revision_administrativa")
    private String observacionRevisionAdministrativa;

    private String motivo;
    private String motivoRechazo; // obligatorio si RECHAZADA
    private OffsetDateTime fechaDecision;
    private Long decididoPorPersonaId;
}