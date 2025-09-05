package edu.ecep.base_app.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity @Table(name="resultados_evaluacion",
        uniqueConstraints=@UniqueConstraint(columnNames={"evaluacion_id","matricula_id"}))
@Getter @Setter
public class ResultadoEvaluacion extends BaseEntity {
    @ManyToOne(optional=false, fetch=FetchType.LAZY) private Evaluacion evaluacion;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) private Matricula matricula;

    private Double notaNumerica;
    @Column(length=20) private String notaConceptual;
    private String observaciones;
}