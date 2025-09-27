package edu.ecep.base_app.shared.notification.domain.repository;

import edu.ecep.base_app.shared.notification.domain.NotificationSetting;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationSettingRepository extends JpaRepository<NotificationSetting, Long> {
    Optional<NotificationSetting> findByClave(String clave);
}
