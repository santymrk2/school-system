package edu.ecep.base_app.dtos;

import lombok.Data;

@Data
public class TypingNotificationDTO {
    private Long receptorId;
    private boolean typing;
}
