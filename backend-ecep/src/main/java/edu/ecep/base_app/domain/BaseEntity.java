package edu.ecep.base_app.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@FilterDef(name = "activoFilter", parameters = @ParamDef(name = "activo", type = Boolean.class))
@Getter
@Setter
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq")
    private Long id;

    @CreatedDate
    @Column(nullable = false, updatable = false, columnDefinition = "timestamptz")
    private OffsetDateTime dateCreated;

    @LastModifiedDate
    @Column(nullable = false, columnDefinition = "timestamptz")
    private OffsetDateTime lastUpdated;

    @CreatedBy
    @Column(name = "created_by", updatable = false)
    private String createdBy;

    @LastModifiedBy
    @Column(name = "modified_by")
    private String modifiedBy;

    @Column(nullable = false)
    protected boolean activo = true;

    @Column(name = "fecha_eliminacion")
    protected OffsetDateTime fechaEliminacion;


    @PreUpdate
    public void preUpdate() {
        // Si la entidad pasa a inactiva y no tiene fecha de eliminación, la seteamos
        if (!this.activo && this.fechaEliminacion == null) {
            this.fechaEliminacion = OffsetDateTime.now();
        }
    }

}





