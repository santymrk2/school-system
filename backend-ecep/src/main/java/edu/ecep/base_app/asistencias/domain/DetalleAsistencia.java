package edu.ecep.base_app.asistencias.domain;

import edu.ecep.base_app.asistencias.domain.enums.EstadoAsistencia;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;

@Entity @Table(name="detalles_asistencia",
        uniqueConstraints=@UniqueConstraint(columnNames={"jornada_id","matricula_id"}))
@SQLDelete(sql = "UPDATE detalles_asistencia SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter @Setter
public class DetalleAsistencia extends BaseEntity {
    @ManyToOne(optional=false, fetch= FetchType.LAZY) private JornadaAsistencia jornada;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) private Matricula matricula;

    @Enumerated(EnumType.STRING) @Column(nullable=false) private EstadoAsistencia estado;
    private String obs;
}

// Regla: validar pertenencia temporal (historial) y bloquear si trimestre.cerrado.