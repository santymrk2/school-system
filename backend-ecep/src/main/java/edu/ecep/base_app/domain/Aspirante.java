package edu.ecep.base_app.domain;

import edu.ecep.base_app.domain.enums.Curso;
import edu.ecep.base_app.domain.enums.Turno;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;


@Entity
@DiscriminatorValue("ASPIRANTE")
@Getter
@Setter
public class Aspirante extends Persona {

    @Column
    @Enumerated(EnumType.STRING)
    private Turno turnoPreferido;

    @Column
    private String escuelaActual;

    @Column(length = 50)
    private String conectividadInternet;

    @Column
    private String dispositivosDisponibles;

    @Column
    private String idiomasHabladosHogar;

    @Column(length = 1000)
    private String enfermedadesAlergias;

    @Column
    private String medicacionHabitual;

    @Column
    private String limitacionesFisicas;

    @Column
    private String tratamientosTerapeuticos;

    @Column
    private Boolean usoAyudasMovilidad;

    @Column
    private String coberturaMedica;

    @Column(length = 1000)
    private String observacionesSalud;

    @Column
    @Enumerated(EnumType.STRING)
    private Curso cursoSolicitado;

    @OneToMany(mappedBy = "aspirante")
    private Set<AspiranteFamiliar> familiares = new HashSet<>();

    @OneToMany(mappedBy = "aspirante")
    private Set<SolicitudAdmision> solicitudes = new HashSet<>();

}
