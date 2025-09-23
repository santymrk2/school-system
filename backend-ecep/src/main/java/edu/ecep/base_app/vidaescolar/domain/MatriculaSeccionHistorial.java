package edu.ecep.base_app.vidaescolar.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;

import java.time.LocalDate;

@Entity
@Table(name="matricula_seccion_historial")
@SQLDelete(sql = "UPDATE matricula_seccion_historial SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter @Setter
public class MatriculaSeccionHistorial extends BaseEntity {
    @ManyToOne(optional=false, fetch=FetchType.LAZY) private Matricula matricula;
    @ManyToOne(optional=false, fetch= FetchType.LAZY) private Seccion seccion;
    @Column(nullable=false) private LocalDate desde;
    private LocalDate hasta; // null = vigente
}
