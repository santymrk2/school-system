package edu.ecep.base_app.shared.domain;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.OffsetDateTime;

/**
 * Clase base para documentos Mongo con auditoría y borrado lógico.
 */
@Getter
@Setter
public abstract class BaseDocument {

    @Id
    private String id;

    @CreatedDate
    @Field("date_created")
    private OffsetDateTime dateCreated;

    @LastModifiedDate
    @Field("last_updated")
    private OffsetDateTime lastUpdated;

    @CreatedBy
    @Field("created_by")
    private String createdBy;

    @LastModifiedBy
    @Field("modified_by")
    private String modifiedBy;

    @Field("activo")
    private boolean activo = true;

    @Field("fecha_eliminacion")
    private OffsetDateTime fechaEliminacion;

    public void markDeleted() {
        this.activo = false;
        if (this.fechaEliminacion == null) {
            this.fechaEliminacion = OffsetDateTime.now();
        }
    }
}
