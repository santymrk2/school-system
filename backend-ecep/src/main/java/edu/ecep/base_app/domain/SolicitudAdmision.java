package edu.ecep.base_app.domain;

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
@EntityListeners(AuditingEntityListener.class)
@Filter(name = "activoFilter", condition = "activo = :activo")
@SQLDelete(sql = "UPDATE solicitudes_admisiones SET activo = false, fecha_eliminacion = now() WHERE id = ?")

@Getter
@Setter
public class SolicitudAdmision extends BaseEntity{
    @Column(nullable = false, length = 50)
    private String estado;

    @Column(length = 1000)
    private String motivoRechazo;

    @Column
    private LocalDate fechaEntrevista;

    @Column
    private Boolean emailConfirmacionEnviado;

    @Column
    private Boolean entrevistaRealizada;

    @Column
    private Boolean autorizadoComunicacionesEmail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aspirante_id", nullable = false)
    private Aspirante aspirante;
}
