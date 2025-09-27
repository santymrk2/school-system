package edu.ecep.base_app.shared.notification;

import jakarta.mail.MessagingException;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.notifications.mail.enabled:true}")
    private boolean enabled;

    @Value("${app.notifications.mail.from:}")
    private String defaultFrom;

    public void sendPlainText(@NonNull String to, @NonNull String subject, @NonNull String body)
            throws MessagingException, MailException {
        if (!enabled) {
            log.info("[EMAIL][DISABLED] to={} subject={}", to, subject);
            return;
        }
        if (!StringUtils.hasText(to)) {
            throw new IllegalArgumentException("El destinatario del correo es obligatorio");
        }

        var message = mailSender.createMimeMessage();
        var helper = new MimeMessageHelper(message, false, StandardCharsets.UTF_8.name());
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(body, false);
        if (StringUtils.hasText(defaultFrom)) {
            helper.setFrom(defaultFrom);
        }

        mailSender.send(message);
        log.info("[EMAIL][SENT] to={} subject={}", to, subject);
    }
}
