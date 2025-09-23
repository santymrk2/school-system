package edu.ecep.base_app.gestionacademica.domain;

import edu.ecep.base_app.shared.domain.enums.NivelAcademico;
import edu.ecep.base_app.shared.domain.enums.Turno;
import edu.ecep.base_app.calendario.domain.PeriodoEscolar;
import edu.ecep.base_app.shared.domain.BaseEntity;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.SQLDelete;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;


@Entity
@Table(name = "secciones",
        uniqueConstraints=@UniqueConstraint(columnNames={
                "periodo_escolar_id","nivel","grado_sala","division","turno"
        }))
@SQLDelete(sql = "UPDATE secciones SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Seccion extends BaseEntity {
    @ManyToOne(optional=false, fetch=FetchType.LAZY)
    private PeriodoEscolar periodoEscolar;

    @Enumerated(EnumType.STRING) @Column(nullable=false)
    private NivelAcademico nivel;

    @Column(nullable=false) private String gradoSala;
    @Column(nullable=false) private String division;

    @Enumerated(EnumType.STRING) @Column(nullable=false)
    private Turno turno;
}
