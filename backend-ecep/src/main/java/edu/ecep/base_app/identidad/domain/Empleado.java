package edu.ecep.base_app.identidad.domain;

import edu.ecep.base_app.finanzas.domain.ReciboSueldo;
import edu.ecep.base_app.identidad.domain.enums.RolEmpleado;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import lombok.Getter;
import lombok.Setter;


@Entity
@Table(name = "personas_empleado")
@Getter
@Setter
public class Empleado {
    @Id Long id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id", foreignKey = @ForeignKey(name = "fk_empleado_persona"))
    private Persona persona;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RolEmpleado rolEmpleado; // DIRECCION, ADMINISTRACION, SECRETARIA, DOCENTE

    @Column(length = 11, unique = true)
    private String cuil;

    @Column(length = 20, unique = true)
    private String legajo;

    private LocalDate fechaIngreso;
    private String condicionLaboral;
    private String cargo;
    private String situacionActual;
    private String antecedentesLaborales;
    private String observacionesGenerales;

    @OneToMany(mappedBy = "empleado")
    private Set<Licencia> licencias = new HashSet<>();

    @OneToMany(mappedBy = "empleado")
    private Set<ReciboSueldo> recibosSueldo = new HashSet<>();

    @OneToMany(mappedBy = "empleado", cascade = CascadeType.ALL, orphanRemoval = false)
    private Set<FormacionAcademica> formaciones = new HashSet<>();
}
