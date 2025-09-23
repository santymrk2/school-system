package edu.ecep.base_app.identidad.domain;

import edu.ecep.base_app.vidaescolar.domain.Matricula;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(name="personas_alumno")
@Getter @Setter
public class Alumno {
    @Id Long id;

    @MapsId
    @OneToOne(fetch=LAZY) @JoinColumn(name="id", foreignKey=@ForeignKey(name="fk_alumno_persona"))
    Persona persona;

    LocalDate fechaInscripcion;
    String observacionesGenerales;
    String motivoRechazoBaja;

    @OneToMany(mappedBy="alumno") Set<Matricula> matriculas = new HashSet<>();
    @OneToMany(mappedBy="alumno") Set<AlumnoFamiliar> familiares = new HashSet<>();
}
