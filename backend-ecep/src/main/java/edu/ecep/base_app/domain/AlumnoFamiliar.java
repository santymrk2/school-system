package edu.ecep.base_app.domain;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;


@Entity
@Table(name = "alumno_familiar",
        uniqueConstraints=@UniqueConstraint(columnNames={"alumno_id","familiar_id"}))
@Getter
@Setter
public class AlumnoFamiliar extends BaseEntity{

    @Column(nullable = false, length = 50)
    private String tipoRelacion;

    @Column(nullable = false)
    private Boolean viveConAlumno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alumno_id", nullable = false)
    private Alumno alumno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "familiar_id", nullable = false)
    private Familiar familiar;
}
