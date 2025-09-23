package edu.ecep.base_app.gestionacademica.domain;

import jakarta.persistence.*;

import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;


@Entity @Table(name="evaluaciones")
@SQLDelete(sql = "UPDATE evaluaciones SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter @Setter
public class Evaluacion extends BaseEntity {
    @ManyToOne(optional=false, fetch=FetchType.LAZY) private SeccionMateria seccionMateria;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) private Trimestre trimestre;
    @Column(nullable=false) private LocalDate fecha;
    private String tema;
    private Double peso;
}

// Validación de servicio: la Matricula debe pertenecer a la Seccion de la Evaluacion en la fecha (usar historial).