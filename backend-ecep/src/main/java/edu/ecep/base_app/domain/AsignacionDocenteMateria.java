package edu.ecep.base_app.domain;

import edu.ecep.base_app.domain.enums.RolMateria;
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
    @ManyToOne(optional=false, fetch=FetchType.LAZY) private Personal personal;

    @Enumerated(EnumType.STRING) @Column(nullable=false) private RolMateria rol;
    @Column(nullable=false) private LocalDate vigenciaDesde;
    private LocalDate vigenciaHasta;
}
