package edu.ecep.base_app.domain;

import edu.ecep.base_app.domain.enums.EstadoMatricula;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.SQLDelete;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Entity
@Table(name = "matriculas",
        uniqueConstraints=@UniqueConstraint(columnNames={"alumno_id","periodo_escolar_id"}))
@SQLDelete(sql = "UPDATE matriculas SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter @Setter

public class Matricula extends BaseEntity {
    @ManyToOne(optional=false, fetch=FetchType.LAZY) private Alumno alumno;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) private PeriodoEscolar periodoEscolar;

    // helpers opcionales de dominio (pueden vivir en un servicio)
    // @Transient public Optional<Seccion> seccionAt(LocalDate fecha) { return Optional.empty(); }
}