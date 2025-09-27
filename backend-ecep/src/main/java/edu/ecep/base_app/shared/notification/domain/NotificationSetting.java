package edu.ecep.base_app.shared.notification.domain;

import edu.ecep.base_app.shared.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "notification_setting")
@Getter
@Setter
public class NotificationSetting extends BaseEntity {

    @Column(name = "clave", nullable = false, unique = true, length = 100)
    private String clave;

    @Column(name = "valor")
    private String valor;
}
