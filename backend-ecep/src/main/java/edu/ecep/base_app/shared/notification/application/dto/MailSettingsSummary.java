package edu.ecep.base_app.shared.notification.application.dto;

public record MailSettingsSummary(
        String host,
        Integer port,
        Boolean auth,
        Boolean starttls,
        String username,
        Boolean enabled,
        String from,
        boolean passwordSet) {}
