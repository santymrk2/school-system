package edu.ecep.base_app.gestionacademica.domain;

import edu.ecep.base_app.gestionacademica.domain.enums.RolMateria;
import edu.ecep.base_app.identidad.domain.Empleado;
import edu.ecep.base_app.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;

import java.time.LocalDate;

@Entity
@Table(name="asignacion_docente_materia")
@SQLDelete(sql = "UPDATE asignacion_docente_materia SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter
@Setter
public class AsignacionDocenteMateria extends BaseEntity {
    @ManyToOne(optional=false, fetch= FetchType.LAZY) private SeccionMateria seccionMateria;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) private Empleado empleado;

    @Enumerated(EnumType.STRING) @Column(nullable=false) private RolMateria rol;
    @Column(nullable=false) private LocalDate vigenciaDesde;
    private LocalDate vigenciaHasta;
}