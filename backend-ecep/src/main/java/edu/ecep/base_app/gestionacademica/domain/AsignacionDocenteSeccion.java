package edu.ecep.base_app.gestionacademica.domain;
import edu.ecep.base_app.gestionacademica.domain.enums.RolSeccion;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;

import java.time.LocalDate;

@Entity @Table(name="asignacion_docente_seccion")
@SQLDelete(sql = "UPDATE asignacion_docente_seccion SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter @Setter
public class AsignacionDocenteSeccion extends BaseEntity {
    @ManyToOne(optional=false, fetch=FetchType.LAZY) private Seccion seccion;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) private Empleado empleado;

    @Enumerated(EnumType.STRING) @Column(nullable=false) private RolSeccion rol;
    @Column(nullable=false) private LocalDate vigenciaDesde;
    private LocalDate vigenciaHasta; // null = vigente
}
