package edu.ecep.base_app.shared.notification;

import edu.ecep.base_app.shared.notification.application.NotificationSettingsService;
import edu.ecep.base_app.shared.notification.application.dto.MailSettingsInternal;
import jakarta.mail.MessagingException;
import java.nio.charset.StandardCharsets;
import java.util.Properties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final NotificationSettingsService notificationSettingsService;

    @Value("${app.notifications.mail.enabled:true}")
    private boolean defaultEnabled;

    @Value("${app.notifications.mail.from:}")
    private String defaultFrom;

    public void sendPlainText(@NonNull String to, @NonNull String subject, @NonNull String body)
            throws MessagingException, MailException {
        if (!StringUtils.hasText(to)) {
            throw new IllegalArgumentException("El destinatario del correo es obligatorio");
        }

        MailSettingsInternal configuredSettings = notificationSettingsService.getMailSettingsInternal();
        boolean notificationsEnabled =
                configuredSettings.enabled() != null ? configuredSettings.enabled() : defaultEnabled;
        if (!notificationsEnabled) {
            log.info("[EMAIL][DISABLED] to={} subject={}", to, subject);
            return;
        }

        JavaMailSender sender = resolveMailSender(configuredSettings);
        String fromAddress = resolveFrom(configuredSettings);

        var message = sender.createMimeMessage();
        var helper = new MimeMessageHelper(message, false, StandardCharsets.UTF_8.name());
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(body, false);
        if (StringUtils.hasText(fromAddress)) {
            helper.setFrom(fromAddress);
        }

        sender.send(message);
        log.info("[EMAIL][SENT] to={} subject={}", to, subject);
    }

    private JavaMailSender resolveMailSender(MailSettingsInternal settings) {
        if (!StringUtils.hasText(settings.host()) || settings.port() == null) {
            return mailSender;
        }

        JavaMailSenderImpl customSender = new JavaMailSenderImpl();
        customSender.setHost(settings.host());
        customSender.setPort(settings.port());
        customSender.setDefaultEncoding(StandardCharsets.UTF_8.name());

        boolean auth = settings.auth() == null ? false : settings.auth();
        if (auth) {
            if (!StringUtils.hasText(settings.username())) {
                throw new IllegalStateException(
                        "El usuario SMTP es obligatorio cuando la autenticación está habilitada");
            }
            if (!StringUtils.hasText(settings.password())) {
                throw new IllegalStateException(
                        "La contraseña SMTP no está configurada para el servidor definido");
            }
            customSender.setUsername(settings.username());
            customSender.setPassword(settings.password());
        }

        Properties properties = customSender.getJavaMailProperties();
        properties.put("mail.smtp.auth", Boolean.toString(auth));
        boolean startTls = settings.starttls() != null && settings.starttls();
        properties.put("mail.smtp.starttls.enable", Boolean.toString(startTls));

        return customSender;
    }

    private String resolveFrom(MailSettingsInternal settings) {
        String configuredFrom = settings.from();
        return StringUtils.hasText(configuredFrom) ? configuredFrom : defaultFrom;
    }
}
