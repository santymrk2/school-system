package edu.ecep.base_app.admisiones.domain;

import edu.ecep.base_app.admisiones.domain.enums.Curso;
import edu.ecep.base_app.identidad.domain.Persona;
import edu.ecep.base_app.shared.domain.enums.Turno;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(name="personas_aspirante")
@Getter @Setter
public class Aspirante {
    @Id Long id;

    @MapsId
    @OneToOne(fetch=LAZY) @JoinColumn(name="id", foreignKey=@ForeignKey(name="fk_aspirante_persona"))
    Persona persona;

    @Enumerated(EnumType.STRING) Turno turnoPreferido;
    String escuelaActual;
    String conectividadInternet;
    String dispositivosDisponibles;
    String idiomasHabladosHogar;
    String enfermedadesAlergias;
    String medicacionHabitual;
    String limitacionesFisicas;
    String tratamientosTerapeuticos;
    Boolean usoAyudasMovilidad;
    String coberturaMedica;
    String observacionesSalud;
    @Enumerated(EnumType.STRING) Curso cursoSolicitado;

    @OneToMany(mappedBy="aspirante") Set<AspiranteFamiliar> familiares = new HashSet<>();
    @OneToMany(mappedBy="aspirante") Set<SolicitudAdmision> solicitudes = new HashSet<>();
}

