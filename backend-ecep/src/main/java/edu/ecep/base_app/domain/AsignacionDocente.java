package edu.ecep.base_app.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.SQLDelete;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;

@Entity
@Table(name = "asignaciones_docentes")
@EntityListeners(AuditingEntityListener.class)
@Filter(name = "activoFilter", condition = "activo = :activo")
@SQLDelete(sql = "UPDATE asignaciones_docentes SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter
@Setter
public class AsignacionDocente extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "personal_id")
    private Personal docente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seccion_id")
    private Seccion seccion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "materia_id")
    private Materia materia; // null = maestro de grado (todas las materias)

    @Column(nullable = false)
    private Boolean esTitular = true; // vs suplente

    @Column
    private LocalDate fechaInicio;

    @Column
    private LocalDate fechaFin;

    @Column(columnDefinition = "text")
    private String observaciones;
}
