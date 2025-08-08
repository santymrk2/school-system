package edu.ecep.base_app.domain;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;


@Entity
@DiscriminatorValue("ALUMNO")
@Getter
@Setter
public class Alumno extends Persona {

    @Column
    private LocalDate fechaInscripcion;

    @Column(length = 500)
    private String observacionesGenerales;

    @Column
    private String motivoRechazoBaja;


    @OneToMany(mappedBy = "alumno")
    private Set<Matricula> matriculas = new HashSet<>();

    @OneToMany(mappedBy = "alumno")
    private Set<AlumnoFamiliar> familiares = new HashSet<>();

}
