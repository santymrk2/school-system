package edu.ecep.base_app.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageDTO {
    private Long id;
    private Long emisorId;
    private Long receptorId;
    private String contenido;
    private OffsetDateTime fechaEnvio;
    private boolean leido;
}
