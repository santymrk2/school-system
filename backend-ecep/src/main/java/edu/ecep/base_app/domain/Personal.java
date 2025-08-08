package edu.ecep.base_app.domain;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import lombok.Getter;
import lombok.Setter;


@Entity
@DiscriminatorValue("PERSONAL")
@Getter
@Setter
public class Personal extends Persona {

    @Column
    private LocalDate fechaIngreso;

    @Column(length = 50)
    private String condicionLaboral;

    @Column(length = 50)
    private String cargo;

    @Column(length = 50)
    private String situacionActual;

    @Column(length = 1000)
    private String antecedentesLaborales;

    @Column(length = 1000)
    private String observacionesGenerales;

    @OneToMany(mappedBy = "docente", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<AsignacionDocente> asignaciones = new HashSet<>();

    @OneToMany(mappedBy = "personal")
    private Set<Licencia> licencias = new HashSet<>();

    @OneToMany(mappedBy = "personal")
    private Set<ReciboSueldo> recibosSueldo = new HashSet<>();

    public Set<Materia> getMateriasImpartidas() {
        return asignaciones.stream()
                .filter(a -> a.getMateria() != null)
                .map(AsignacionDocente::getMateria)
                .collect(Collectors.toSet());
    }

    public Set<Seccion> getSeccionesAsignadas() {
        return asignaciones.stream()
                .map(AsignacionDocente::getSeccion)
                .collect(Collectors.toSet());
    }
}
