package edu.ecep.base_app.finanzas.domain;

import edu.ecep.base_app.finanzas.domain.enums.ConceptoCuota;
import edu.ecep.base_app.finanzas.domain.enums.EstadoCuota;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;

@Entity @Table(name="cuotas")
@SQLDelete(sql = "UPDATE cuotas SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter @Setter
public class Cuota extends BaseEntity {
    @ManyToOne(optional=false, fetch=FetchType.LAZY) private Matricula matricula;
    @ManyToOne(fetch=FetchType.LAZY) private EmisionCuota emision; // nullable

    @Enumerated(EnumType.STRING) @Column(nullable=false) private ConceptoCuota concepto;
    private String subconcepto; // solo MATERIALES/OTROS

    @Column(nullable=false) private Integer anio;
    private Integer mes; // solo si MENSUALIDAD

    @Column(nullable=false) private BigDecimal importe;
    @Column(nullable=false) private LocalDate fechaVencimiento;
    @Column(nullable=false) private BigDecimal porcentajeRecargo = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING) @Column(nullable=false) private EstadoCuota estado = EstadoCuota.PENDIENTE;

    @Column(nullable=false, unique=true, length=60)
    private String codigoPago;

    private String observaciones;
}