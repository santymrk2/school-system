package edu.ecep.base_app.shared.notification.application.dto;

public record MailSettingsUpdateCommand(
        String host,
        Integer port,
        Boolean auth,
        Boolean starttls,
        String username,
        String password,
        Boolean enabled,
        String from) {}
