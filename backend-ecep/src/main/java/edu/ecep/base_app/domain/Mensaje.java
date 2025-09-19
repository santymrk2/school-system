package edu.ecep.base_app.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;

@Entity
@Table(name = "mensajes")
@SQLDelete(sql = "UPDATE mensajes SET activo = false, fecha_eliminacion = now() WHERE id = ?")
@Getter
@Setter
public class Mensaje extends BaseEntity {
    @Column(nullable = false)
    private OffsetDateTime fechaEnvio;

    @Column
    private String asunto;

    @Column(nullable = false, columnDefinition = "text")
    private String contenido;

    @Column(nullable = false)
    private Boolean leido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emisor_id", nullable = false)
    private Persona emisor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receptor_id", nullable = false)
    private Persona receptor;
}
