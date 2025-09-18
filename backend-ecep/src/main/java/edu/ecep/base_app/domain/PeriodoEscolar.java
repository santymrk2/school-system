package edu.ecep.base_app.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;

@Entity
@Table(name="periodos_escolares")
@SQLDelete(sql = "UPDATE periodos_escolares SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter
@Setter
public class PeriodoEscolar extends BaseEntity {
    @Column(nullable=false, unique=true)
    private Integer anio;

    @Column(nullable = false)
    private boolean cerrado = false;
}
