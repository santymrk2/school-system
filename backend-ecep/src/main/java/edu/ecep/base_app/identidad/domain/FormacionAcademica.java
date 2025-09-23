package edu.ecep.base_app.identidad.domain;

import edu.ecep.base_app.shared.domain.BaseEntity;
import jakarta.persistence.*;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;


@Entity
@Table(name = "formaciones_academicas")
@SQLDelete(sql = "UPDATE formaciones_academicas SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter
@Setter
public class FormacionAcademica extends BaseEntity{

    @Column(nullable = false, length = 100)
    private String nivel;

    @Column(nullable = false)
    private String institucion;

    @Column
    private String tituloObtenido;

    @Column
    private LocalDate fechaInicio;

    @Column
    private LocalDate fechaFin;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "empleado_id", nullable = false)
    private Empleado empleado;

}