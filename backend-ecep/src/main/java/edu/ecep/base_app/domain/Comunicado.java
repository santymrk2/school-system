package edu.ecep.base_app.domain;

import edu.ecep.base_app.domain.enums.AlcanceComunicado;
import edu.ecep.base_app.domain.enums.NivelAcademico;
import jakarta.persistence.*;

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


@Entity
@Table(name = "comunicados")
@SQLDelete(sql = "UPDATE comunicados SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter @Setter
public class Comunicado extends BaseEntity {
    @Enumerated(EnumType.STRING) @Column(nullable=false)
    private AlcanceComunicado alcance;

    @ManyToOne(fetch=FetchType.LAZY) private Seccion seccion; // solo si POR_SECCION
    @Enumerated(EnumType.STRING) private NivelAcademico nivel; // solo si POR_NIVEL

    @Column(nullable=false) private String titulo;
    @Column(nullable=false, length=5000) private String cuerpo;
    private OffsetDateTime fechaProgPublicacion;
    @Column(nullable=false) private boolean publicado = false;
}

