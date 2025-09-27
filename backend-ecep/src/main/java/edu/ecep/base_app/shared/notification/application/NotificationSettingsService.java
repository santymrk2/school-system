package edu.ecep.base_app.shared.notification.application;

import edu.ecep.base_app.shared.notification.application.dto.MailSettingsInternal;
import edu.ecep.base_app.shared.notification.application.dto.MailSettingsSummary;
import edu.ecep.base_app.shared.notification.application.dto.MailSettingsUpdateCommand;
import edu.ecep.base_app.shared.notification.domain.NotificationSetting;
import edu.ecep.base_app.shared.notification.domain.repository.NotificationSettingRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class NotificationSettingsService {

    private final NotificationSettingRepository repository;

    private static final String MAIL_HOST_KEY = "mail.host";
    private static final String MAIL_PORT_KEY = "mail.port";
    private static final String MAIL_AUTH_KEY = "mail.auth";
    private static final String MAIL_STARTTLS_KEY = "mail.starttls";
    private static final String MAIL_USERNAME_KEY = "mail.username";
    private static final String MAIL_PASSWORD_KEY = "mail.password";
    private static final String MAIL_ENABLED_KEY = "mail.enabled";
    private static final String MAIL_FROM_KEY = "mail.from";

    @Value("${app.notifications.mail.enabled:true}")
    private boolean defaultEnabled;

    @Value("${app.notifications.mail.from:}")
    private String defaultFrom;

    @Transactional(readOnly = true)
    public MailSettingsSummary getMailSettings() {
        return new MailSettingsSummary(
                getString(MAIL_HOST_KEY),
                getInteger(MAIL_PORT_KEY),
                getBoolean(MAIL_AUTH_KEY),
                getBoolean(MAIL_STARTTLS_KEY),
                getString(MAIL_USERNAME_KEY),
                resolveEnabled(),
                resolveFrom(),
                hasPassword());
    }

    @Transactional(readOnly = true)
    public MailSettingsInternal getMailSettingsInternal() {
        return new MailSettingsInternal(
                getString(MAIL_HOST_KEY),
                getInteger(MAIL_PORT_KEY),
                getBoolean(MAIL_AUTH_KEY),
                getBoolean(MAIL_STARTTLS_KEY),
                getString(MAIL_USERNAME_KEY),
                getString(MAIL_PASSWORD_KEY),
                resolveEnabled(),
                resolveFrom());
    }

    @Transactional
    public void updateMailSettings(MailSettingsUpdateCommand command) {
        boolean auth = command.auth() == null ? true : command.auth();
        boolean starttls = command.starttls() == null ? false : command.starttls();
        boolean enabled = command.enabled() == null ? true : command.enabled();

        String existingHost = getString(MAIL_HOST_KEY);
        Integer existingPort = getInteger(MAIL_PORT_KEY);
        String existingUsername = getString(MAIL_USERNAME_KEY);
        String existingFrom = getString(MAIL_FROM_KEY);

        boolean hostProvided = command.host() != null;
        boolean portProvided = command.port() != null;
        boolean usernameProvided = command.username() != null;
        boolean fromProvided = command.from() != null;

        String host = hostProvided
                ? (StringUtils.hasText(command.host()) ? StringUtils.trimWhitespace(command.host()) : null)
                : existingHost;
        Integer port = portProvided ? command.port() : existingPort;
        String username = usernameProvided
                ? (StringUtils.hasText(command.username()) ? StringUtils.trimWhitespace(command.username()) : null)
                : existingUsername;
        String from = fromProvided
                ? (StringUtils.hasText(command.from()) ? StringUtils.trimWhitespace(command.from()) : null)
                : existingFrom;

        if (enabled) {
            if (!StringUtils.hasText(host)) {
                throw new IllegalArgumentException("El servidor SMTP es obligatorio");
            }
            if (port == null) {
                throw new IllegalArgumentException("El puerto SMTP es obligatorio");
            }
        }

        if (enabled && auth) {
            if (!StringUtils.hasText(username)) {
                throw new IllegalArgumentException(
                        "El usuario SMTP es obligatorio cuando la autenticación está habilitada");
            }
            if (command.password() == null && !hasPassword()) {
                throw new IllegalArgumentException("Debés ingresar la contraseña SMTP");
            }
        }

        if (!auth) {
            username = null;
        }

        upsert(MAIL_HOST_KEY, host);
        upsert(MAIL_PORT_KEY, port != null ? String.valueOf(port) : null);
        upsert(MAIL_AUTH_KEY, Boolean.toString(auth));
        upsert(MAIL_STARTTLS_KEY, Boolean.toString(starttls));
        upsert(MAIL_USERNAME_KEY, username);
        upsert(MAIL_ENABLED_KEY, Boolean.toString(enabled));
        upsert(MAIL_FROM_KEY, from);

        if (command.password() != null) {
            if (StringUtils.hasText(command.password())) {
                upsert(MAIL_PASSWORD_KEY, command.password());
            } else {
                delete(MAIL_PASSWORD_KEY);
            }
        } else if (!auth) {
            delete(MAIL_PASSWORD_KEY);
        }
    }

    private boolean hasPassword() {
        return repository.findByClave(MAIL_PASSWORD_KEY)
                .map(NotificationSetting::getValor)
                .filter(StringUtils::hasText)
                .isPresent();
    }

    private Boolean resolveEnabled() {
        Boolean stored = getBoolean(MAIL_ENABLED_KEY);
        return stored != null ? stored : defaultEnabled;
    }

    private String resolveFrom() {
        String stored = getString(MAIL_FROM_KEY);
        return StringUtils.hasText(stored) ? stored : defaultFrom;
    }

    private String getString(String key) {
        return repository.findByClave(key).map(NotificationSetting::getValor).orElse(null);
    }

    private Integer getInteger(String key) {
        return repository.findByClave(key)
                .map(NotificationSetting::getValor)
                .filter(StringUtils::hasText)
                .map(Integer::valueOf)
                .orElse(null);
    }

    private Boolean getBoolean(String key) {
        return repository.findByClave(key)
                .map(NotificationSetting::getValor)
                .filter(StringUtils::hasText)
                .map(Boolean::valueOf)
                .orElse(null);
    }

    private void upsert(String key, String value) {
        Optional<NotificationSetting> existing = repository.findByClave(key);
        if (StringUtils.hasText(value)) {
            NotificationSetting setting = existing.orElseGet(NotificationSetting::new);
            setting.setClave(key);
            setting.setValor(value);
            repository.save(setting);
        } else {
            existing.ifPresent(repository::delete);
        }
    }

    private void delete(String key) {
        repository.findByClave(key).ifPresent(repository::delete);
    }
}
