package edu.ecep.base_app.shared.notification.presentation.dto;

public record MailSettingsResponse(
        String host,
        Integer port,
        Boolean auth,
        Boolean starttls,
        String username,
        Boolean enabled,
        String from,
        boolean passwordSet) {}
