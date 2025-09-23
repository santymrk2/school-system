package edu.ecep.base_app.asistencias.domain;

import edu.ecep.base_app.gestionacademica.domain.Seccion;
import edu.ecep.base_app.gestionacademica.domain.Trimestre;
import edu.ecep.base_app.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;

import java.time.LocalDate;

@Entity
@Table(name="jornadas_asistencia",
        uniqueConstraints=@UniqueConstraint(columnNames={"seccion_id","fecha"}))
@SQLDelete(sql = "UPDATE jornadas_asistencia SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter
@Setter
public class JornadaAsistencia extends BaseEntity {
    @ManyToOne(optional=false, fetch= FetchType.LAZY) private Seccion seccion;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) private Trimestre trimestre;
    @Column(nullable=false) private LocalDate fecha;
}
