package edu.ecep.base_app.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;


@Entity
@Table(name = "licencias")
@SQLDelete(sql = "UPDATE licencias SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter
@Setter
public class Licencia extends BaseEntity{

    @Column(nullable = false, length = 50)
    private String tipoLicencia;

    @Column(nullable = false)
    private LocalDate fechaInicio;

    @Column(nullable = false)
    private LocalDate fechaFin;

    @Column(length = 1000)
    private String motivo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empleado_id", nullable = false)
    private Empleado empleado;
}
