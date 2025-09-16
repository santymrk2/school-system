package edu.ecep.base_app.domain;

import edu.ecep.base_app.domain.enums.EstadoActaAccidente;
import jakarta.persistence.*;

import java.time.LocalDate;

import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.*;

@Entity @Table(name="actas_accidente")
@SQLDelete(sql = "UPDATE actas_accidente SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter @Setter
public class ActaAccidente extends BaseEntity {
    @ManyToOne(optional=false, fetch=FetchType.LAZY) private Alumno alumno; // o Matricula si querés anclar al año
    @Column(nullable=false) private LocalDate fechaSuceso;
    @Column(nullable=false, length=4000) private String descripcion;

    // debe ser editable hasta suceso + 2 días
    @Enumerated(EnumType.STRING) @Column(nullable=false) private EstadoActaAccidente estado = EstadoActaAccidente.BORRADOR;

    private String creadoPor; // usuario

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Empleado informante;  // quien reportó el accidente (obligatorio)
}