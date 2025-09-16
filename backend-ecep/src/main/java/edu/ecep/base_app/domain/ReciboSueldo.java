package edu.ecep.base_app.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;

@Entity @Table(name="recibos_sueldo",
        uniqueConstraints=@UniqueConstraint(columnNames={"empleado_id","anio","mes"}))
@SQLDelete(sql = "UPDATE recibos_sueldo SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter @Setter
public class ReciboSueldo extends BaseEntity {
    @ManyToOne(optional=false, fetch=FetchType.LAZY) private Empleado empleado;
    @Column(nullable=false) private Integer anio;
    @Column(nullable=false) private Integer mes;

    @Column(nullable=false) private BigDecimal bruto;
    @Column(nullable=false) private BigDecimal neto;

    @Column(nullable=false) private boolean recibiConforme = false;
    private OffsetDateTime fechaConfirmacion;
    private String obsConfirmacion;
    private String comprobanteArchivoId;
}

//vertigo ?