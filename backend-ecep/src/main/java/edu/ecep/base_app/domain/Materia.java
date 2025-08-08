package edu.ecep.base_app.domain;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;
import org.hibernate.annotations.SQLDelete;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;


@Entity
@Table(name = "materias")
@EntityListeners(AuditingEntityListener.class)
@Filter(name = "activoFilter", condition = "activo = :activo")
@SQLDelete(sql = "UPDATE materias SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Materia extends BaseEntity{
    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false, length = 50)
    private String nivelAcademico;

    @OneToMany(mappedBy = "materia", fetch = FetchType.LAZY)
    private Set<Calificacion> calificaciones = new HashSet<>();

    @OneToMany(mappedBy = "materia", fetch = FetchType.LAZY)
    private Set<Evaluacion> evaluaciones = new HashSet<>();

    @OneToMany(mappedBy = "materia", fetch = FetchType.LAZY)
    private Set<AsignacionDocente> asignaciones = new HashSet<>();
}
