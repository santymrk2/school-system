package edu.ecep.base_app.identidad.domain;

import edu.ecep.base_app.shared.domain.BaseEntity;
import edu.ecep.base_app.shared.domain.enums.RolVinculo;
import jakarta.persistence.*;

import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import static jakarta.persistence.FetchType.LAZY;


@Entity
@Table(name = "alumno_familiar",
        uniqueConstraints=@UniqueConstraint(columnNames={"alumno_id","familiar_id"}))
@Getter
@Setter
public class AlumnoFamiliar extends BaseEntity{

    @Enumerated(EnumType.STRING) @Column(nullable=false)
    RolVinculo rolVinculo;

    @Column(nullable = false)
    private Boolean convive;

    @ManyToOne(fetch=LAZY) @JoinColumn(name="alumno_id", nullable=false)
    Alumno alumno;

    @ManyToOne(fetch=LAZY) @JoinColumn(name="familiar_id", nullable=false)
    Familiar familiar;

}
