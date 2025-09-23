package edu.ecep.base_app.gestionacademica.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;

import java.time.LocalDate;

@Entity
@Table(name="trimestres")
@SQLDelete(sql = "UPDATE trimestres SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter
@Setter
public class Trimestre extends BaseEntity {
    @ManyToOne(optional=false, fetch= FetchType.LAZY)
    private PeriodoEscolar periodoEscolar;

    @Column(nullable=false) private Integer orden;
    @Column(nullable=false) private LocalDate inicio;
    @Column(nullable=false) private LocalDate fin;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TrimestreEstado estado = TrimestreEstado.INACTIVO;
}