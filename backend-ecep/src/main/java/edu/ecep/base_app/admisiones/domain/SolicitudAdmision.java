package edu.ecep.base_app.admisiones.domain;

import edu.ecep.base_app.shared.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;
import org.hibernate.annotations.SQLDelete;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;


@Entity
@Table(name = "solicitudes_admisiones")
@SQLDelete(sql = "UPDATE solicitudes_admisiones SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter
@Setter
public class SolicitudAdmision extends BaseEntity{
    @Column(nullable = false, length = 50)
    private String estado;

    @Column(length = 100)
    private String disponibilidadCurso;

    @Column
    private Boolean cupoDisponible;

    @Column(length = 1000)
    private String motivoRechazo;

    @Column
    private LocalDate fechaEntrevista; // fecha confirmada con la familia

    @Column
    private LocalDate propuestaFecha1;

    @Column
    private LocalDate propuestaFecha2;

    @Column
    private LocalDate propuestaFecha3;

    @Column(length = 100)
    private String propuestaHorario1;

    @Column(length = 100)
    private String propuestaHorario2;

    @Column(length = 100)
    private String propuestaHorario3;

    @Column(length = 2000)
    private String propuestaNotas;

    @Column
    private LocalDate fechaLimiteRespuesta;

    @Column
    private LocalDate fechaRespuestaFamilia;

    @Column
    private Boolean emailConfirmacionEnviado;

    @Column
    private Boolean entrevistaRealizada;

    @Column(length = 2000)
    private String documentosRequeridos;

    @Column(length = 2000)
    private String adjuntosInformativos;

    @Column(length = 1000)
    private String notasDireccion;

    @Column(length = 2000)
    private String comentariosEntrevista;

    @Column
    private Boolean autorizadoComunicacionesEmail;

    @Column
    private Boolean puedeSolicitarReprogramacion;

    @Column
    private Boolean reprogramacionSolicitada;

    @Column(length = 2000)
    private String comentarioReprogramacion;

    @Column
    private Integer cantidadPropuestasEnviadas;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aspirante_id", nullable = false)
    private Aspirante aspirante;
}