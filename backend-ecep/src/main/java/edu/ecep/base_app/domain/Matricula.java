package edu.ecep.base_app.domain;

import edu.ecep.base_app.domain.enums.EstadoMatricula;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.SQLDelete;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "matriculas")
@EntityListeners(AuditingEntityListener.class)
@Filter(name = "activoFilter", condition = "activo = :activo")
@SQLDelete(sql = "UPDATE matriculas SET activo = false, fecha_eliminacion = now() WHERE id = ?")

@Getter @Setter
public class Matricula extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Alumno alumno;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Seccion seccion;

    @Column(nullable = false)
    private Integer anioLectivo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoMatricula estado;

    private LocalDate fechaInicio;
    private LocalDate fechaFin;

    @OneToMany(mappedBy = "matricula")
    private Set<Calificacion> calificaciones = new HashSet<>();

    @OneToMany(mappedBy = "matricula")
    private Set<RegistroAsistencia> asistencias = new HashSet<>();

    @OneToMany(mappedBy = "matricula")
    private Set<PagoCuota> pagosCuota = new HashSet<>();

    @OneToMany(mappedBy = "matricula")
    private Set<InformeInicial> informes = new HashSet<>();

    @OneToMany(mappedBy = "matricula")
    private Set<ActaAccidente> actasAccidente = new HashSet<>();
}