package edu.ecep.base_app.finanzas.domain;

import edu.ecep.base_app.gestionacademica.domain.Seccion;
import edu.ecep.base_app.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;

@Entity
@Table(name="emision_cuota_seccion")
@SQLDelete(sql = "UPDATE emision_cuota_seccion SET activo = false, fecha_eliminacion = now() WHERE id = ?")

@Getter
@Setter
public class EmisionCuotaSeccion extends BaseEntity {
    @ManyToOne(optional=false, fetch= FetchType.LAZY) private EmisionCuota emision;
    @ManyToOne(optional=false, fetch=FetchType.LAZY) private Seccion seccion;
}
