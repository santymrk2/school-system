package edu.ecep.base_app.vidaescolar.domain;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;
import org.hibernate.annotations.SQLDelete;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;


@Entity @Table(name="informes_inicial",
        uniqueConstraints=@UniqueConstraint(columnNames={"trimestre_id","matricula_id"}))
@SQLDelete(sql = "UPDATE informes_inicial SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter @Setter
public class InformeInicial extends BaseEntity {
    @ManyToOne(optional=false, fetch=FetchType.LAZY) private Trimestre trimestre;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) private Matricula matricula;

    @Column(nullable=false, length=2000) private String descripcion;
    @Column(nullable=false) private boolean publicado = false;
}