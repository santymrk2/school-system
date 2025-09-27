package edu.ecep.base_app.shared.notification.presentation.rest;

import edu.ecep.base_app.shared.notification.application.NotificationSettingsService;
import edu.ecep.base_app.shared.notification.application.dto.MailSettingsSummary;
import edu.ecep.base_app.shared.notification.application.dto.MailSettingsUpdateCommand;
import edu.ecep.base_app.shared.notification.presentation.dto.MailSettingsRequest;
import edu.ecep.base_app.shared.notification.presentation.dto.MailSettingsResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notificaciones/configuracion/correo")
@RequiredArgsConstructor
@Validated
public class NotificationSettingsController {

    private final NotificationSettingsService notificationSettingsService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTOR')")
    public MailSettingsResponse getMailSettings() {
        MailSettingsSummary summary = notificationSettingsService.getMailSettings();
        return new MailSettingsResponse(
                summary.host(),
                summary.port(),
                summary.auth(),
                summary.starttls(),
                summary.username(),
                summary.enabled(),
                summary.from(),
                summary.passwordSet());
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTOR')")
    public ResponseEntity<Void> updateMailSettings(@Valid @RequestBody MailSettingsRequest request) {
        notificationSettingsService.updateMailSettings(
                new MailSettingsUpdateCommand(
                        request.host(),
                        request.port(),
                        request.auth(),
                        request.starttls(),
                        request.username(),
                        request.password(),
                        request.enabled(),
                        request.from()));
        return ResponseEntity.noContent().build();
    }
}
