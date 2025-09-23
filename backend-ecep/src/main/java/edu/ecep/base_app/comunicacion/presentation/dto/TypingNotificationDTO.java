package edu.ecep.base_app.comunicacion.presentation.dto;

import lombok.Data;

@Data
public class TypingNotificationDTO {
    private Long receptorId;
    private boolean typing;
}
