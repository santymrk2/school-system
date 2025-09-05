package edu.ecep.base_app.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.SQLDelete;

@Entity
@Table(name="seccion_materia",
        uniqueConstraints=@UniqueConstraint(columnNames={"seccion_id","materia_id"}))
@SQLDelete(sql = "UPDATE seccion_materia SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter
@Setter
public class SeccionMateria extends BaseEntity {
    @ManyToOne(optional=false, fetch= FetchType.LAZY) private Seccion seccion;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) private Materia materia;
}