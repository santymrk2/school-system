package edu.ecep.base_app.domain;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;
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
@Table(name = "formaciones_academicas")
@SQLDelete(sql = "UPDATE formaciones_academicas SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter
@Setter
public class FormacionAcademica extends BaseEntity{

    @Column(nullable = false, length = 100)
    private String nivel;

    @Column(nullable = false)
    private String institucion;

    @Column
    private String tituloObtenido;

    @Column
    private LocalDate fechaInicio;

    @Column
    private LocalDate fechaFin;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "personal_id", nullable = false)
    private Personal personal;

}
