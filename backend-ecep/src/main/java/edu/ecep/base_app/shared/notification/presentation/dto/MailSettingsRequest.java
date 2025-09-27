package edu.ecep.base_app.shared.notification.presentation.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record MailSettingsRequest(
        String host,
        @Min(value = 1, message = "El puerto debe ser mayor a 0")
                @Max(value = 65535, message = "El puerto no puede superar 65535")
                Integer port,
        Boolean auth,
        Boolean starttls,
        String username,
        String password,
        Boolean enabled,
        String from) {}
