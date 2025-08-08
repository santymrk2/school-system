package edu.ecep.base_app.domain;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;


@Entity
@DiscriminatorValue("FAMILIAR")
@Getter
@Setter
public class Familiar extends Persona {

    @Column
    private String ocupacion;

    @OneToMany(mappedBy = "familiar")
    private Set<AlumnoFamiliar> familiarAlumnoFamiliares = new HashSet<>();

    @OneToMany(mappedBy = "familiar")
    private Set<AspiranteFamiliar> familiarAspiranteFamiliares = new HashSet<>();

}
