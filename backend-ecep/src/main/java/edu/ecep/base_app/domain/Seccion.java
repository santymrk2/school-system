package edu.ecep.base_app.domain;

import edu.ecep.base_app.domain.enums.Turno;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.SQLDelete;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;


@Entity
@Table(name = "secciones")
@EntityListeners(AuditingEntityListener.class)
@Filter(name = "activoFilter", condition = "activo = :activo")
@SQLDelete(sql = "UPDATE secciones SET activo = false, fecha_eliminacion = now() WHERE id = ?")


@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Seccion extends BaseEntity{
    @Column(nullable = false)
    private Integer anioLectivo;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false, length = 50)
    private String nivelAcademico;

    @Column
    private Integer grado;

    @Column
    @Enumerated(EnumType.STRING)
    private Turno turno;

    @OneToMany(mappedBy = "seccion", fetch = FetchType.LAZY)
    private Set<AsignacionDocente> asignaciones = new HashSet<>();

    @OneToMany(mappedBy = "seccion", fetch = FetchType.LAZY)
    private Set<Matricula> matriculas = new HashSet<>();

    @OneToMany(mappedBy = "seccionDestino")
    private Set<Comunicado> seccionDestinoComunicados = new HashSet<>();

    @OneToMany(mappedBy = "seccion")
    private Set<Evaluacion> seccionEvaluaciones = new HashSet<>();

    @OneToMany(mappedBy = "seccion")
    private Set<AsistenciaDia> seccionAsistenciaDias = new HashSet<>();

    @OneToMany(mappedBy = "seccion")
    private Set<Cuota> cuotas = new HashSet<>();

    public Set<Materia> getMaterias() {
        return asignaciones.stream()
                .filter(a -> a.getMateria() != null)
                .map(AsignacionDocente::getMateria)
                .collect(Collectors.toSet());
    }
}
