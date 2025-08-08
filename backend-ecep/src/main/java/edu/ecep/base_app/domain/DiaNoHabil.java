package edu.ecep.base_app.domain;

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


@Entity
@Table(name = "dias_no_habiles")
@EntityListeners(AuditingEntityListener.class)
@Filter(name = "activoFilter", condition = "activo = :activo")
@SQLDelete(sql = "UPDATE dias_no_habiles SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter
@Setter
public class DiaNoHabil extends BaseEntity {
    @Column(nullable = false)
    private LocalDate fecha;

    @Column
    private String descripcion;
}
