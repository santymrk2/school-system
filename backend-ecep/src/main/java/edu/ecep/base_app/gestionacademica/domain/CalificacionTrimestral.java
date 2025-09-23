package edu.ecep.base_app.gestionacademica.domain;

import edu.ecep.base_app.gestionacademica.domain.enums.CalificacionConceptual;
import edu.ecep.base_app.shared.domain.BaseEntity;
import edu.ecep.base_app.vidaescolar.domain.Matricula;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;

// Esta entidad es especifica para las calificaciones finales de los alumnos de primaria.
@Entity @Table(name="calificaciones_trimestrales",
        uniqueConstraints=@UniqueConstraint(columnNames={"trimestre_id","seccion_materia_id","matricula_id"}))
@SQLDelete(sql = "UPDATE calificaciones_trimestrales SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter @Setter
public class CalificacionTrimestral extends BaseEntity {
    @ManyToOne(optional=false, fetch=FetchType.LAZY) private Trimestre trimestre;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) private SeccionMateria seccionMateria;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) private Matricula matricula;

    private Double notaNumerica;
    @Enumerated(EnumType.STRING) @Column(length=20) private CalificacionConceptual notaConceptual;
    private String observaciones;
}
