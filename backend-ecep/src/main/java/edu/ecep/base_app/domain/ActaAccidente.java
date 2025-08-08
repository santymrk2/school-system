package edu.ecep.base_app.domain;

import jakarta.persistence.*;

import java.time.OffsetDateTime;

import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "actas_accidente")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@Filter(name = "activoFilter", condition = "activo = :activo")
@SQLDelete(sql = "UPDATE actas_accidente SET activo = false, fecha_eliminacion = now() WHERE id = ?")
public class ActaAccidente extends BaseEntity{

    @Column(nullable = false)
    private OffsetDateTime fechaAccidente;

    @Column
    private String lugar;

    @Column(nullable = false, columnDefinition = "text")
    private String descripcion;

    @Column(columnDefinition = "text")
    private String accionesTomadas;

    @ManyToOne()
    @JoinColumn(name = "matricula_id")
    private Matricula matricula;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creado_por_id")
    private Usuario creadoPor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alumno_involucrado_id")
    private Alumno alumnoInvolucrado;



}
