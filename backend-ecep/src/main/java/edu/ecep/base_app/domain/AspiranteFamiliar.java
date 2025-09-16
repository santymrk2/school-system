package edu.ecep.base_app.domain;

import edu.ecep.base_app.domain.enums.RolVinculo;
import jakarta.persistence.*;

import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;


@Entity
@Table(name = "aspirantes_familiares")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
public class AspiranteFamiliar extends BaseEntity {

    @Enumerated(EnumType.STRING) @Column(nullable=false)
    RolVinculo rolVinculo;

    @Column(nullable = false)
    private Boolean convive;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aspirante_id", nullable = false)
    private Aspirante aspirante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "familiar_id", nullable = false)
    private Familiar familiar;
}
