package edu.ecep.base_app.finanzas.domain;

import edu.ecep.base_app.shared.domain.BaseEntity;
import edu.ecep.base_app.finanzas.domain.enums.ConceptoCuota;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name="emision_cuota")
@SQLDelete(sql = "UPDATE emision_cuota SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter
@Setter
public class EmisionCuota extends BaseEntity {
    @Column(nullable=false) private LocalDateTime fechaEmision = LocalDateTime.now();
    @Column(nullable=false) private Integer anio;
    private Integer mes; // null para no mensuales
    @Enumerated(EnumType.STRING) @Column(nullable=false) private ConceptoCuota concepto;
    private String subconcepto; // solo MATERIALES/OTROS
    @Column(nullable=false) private BigDecimal porcentajeRecargoDefault = BigDecimal.ZERO;
    private String creadoPor;
    @Column(columnDefinition="TEXT") private String criterios; // JSON/Texto
}