package edu.ecep.base_app.finanzas.domain;

import edu.ecep.base_app.shared.domain.BaseEntity;
import edu.ecep.base_app.finanzas.domain.enums.EstadoPago;
import edu.ecep.base_app.finanzas.domain.enums.MedioPago;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;
import org.hibernate.annotations.SQLDelete;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity @Table(name="pagos_cuota")
@SQLDelete(sql = "UPDATE pagos_cuota SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter @Setter
public class PagoCuota extends BaseEntity {
    @ManyToOne(optional=false, fetch=FetchType.LAZY) private Cuota cuota;

    @Enumerated(EnumType.STRING) @Column(nullable=false) private MedioPago medioPago;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private EstadoPago estadoPago = EstadoPago.EN_REVISION;
    @Column(nullable=false) private BigDecimal montoPagado;

    private OffsetDateTime fechaPago;
    private OffsetDateTime fechaAcreditacion;
    private String referenciaExterna;      // id de pasarela
    private String comprobanteArchivoId;   // adjunto
}