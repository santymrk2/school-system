package edu.ecep.base_app.domain;

import edu.ecep.base_app.domain.enums.Turno;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.SQLDelete;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;


@Entity
@Table(name = "cuotas")
@EntityListeners(AuditingEntityListener.class)
@Filter(name = "activoFilter", condition = "activo = :activo")
@SQLDelete(sql = "UPDATE cuotas SET activo = false, fecha_eliminacion = now() WHERE id = ?")

@Getter
@Setter
public class Cuota extends BaseEntity{

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @Column(nullable = false)
    private LocalDate fechaEmision;

    @Column(nullable = false)
    private LocalDate fechaVencimiento;

    @Column(length = 50)
    private String nivelAcademico;

    @ManyToOne
    @JoinColumn(name = "seccion_id")
    private Seccion seccion;

    @Column
    @Enumerated(EnumType.STRING)
    private Turno turno;

    @OneToMany(mappedBy = "cuota")
    private Set<PagoCuota> cuotaPagoCuotas = new HashSet<>();
}
