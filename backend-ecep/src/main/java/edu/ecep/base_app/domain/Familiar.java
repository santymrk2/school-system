package edu.ecep.base_app.domain;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

import static jakarta.persistence.FetchType.LAZY;


@Entity @Table(name="personas_familiar")
@Getter @Setter
public class Familiar {
    @Id Long id;

    @MapsId
    @OneToOne(fetch=LAZY) @JoinColumn(name="id", foreignKey=@ForeignKey(name="fk_familiar_persona"))
    Persona persona;

    String ocupacion;

    @OneToMany(mappedBy="familiar") Set<AlumnoFamiliar> familiarAlumnoFamiliares = new HashSet<>();
    @OneToMany(mappedBy="familiar") Set<AspiranteFamiliar> familiarAspiranteFamiliares = new HashSet<>();
}
