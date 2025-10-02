package edu.ecep.base_app.comunicacion.domain;

import edu.ecep.base_app.comunicacion.domain.enums.EstadoLecturaComunicado;
import edu.ecep.base_app.identidad.domain.Persona;
import edu.ecep.base_app.shared.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;

import java.time.OffsetDateTime;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(name = "comunicado_lecturas",
       uniqueConstraints = @UniqueConstraint(columnNames = {"comunicado_id", "persona_id"}))
@SQLDelete(sql = "UPDATE comunicado_lecturas SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter
@Setter
public class ComunicadoLectura extends BaseEntity {

    @ManyToOne(optional = false, fetch = LAZY)
    @JoinColumn(name = "comunicado_id", nullable = false)
    private Comunicado comunicado;

    @ManyToOne(optional = false, fetch = LAZY)
    @JoinColumn(name = "persona_id", nullable = false)
    private Persona persona;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoLecturaComunicado estado = EstadoLecturaComunicado.PENDIENTE;

    @Column(name = "fecha_lectura", columnDefinition = "timestamptz")
    private OffsetDateTime fechaLectura;
}
