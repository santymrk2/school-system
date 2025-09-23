package edu.ecep.base_app.comunicacion.infrastructure.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ecep.base_app.comunicacion.presentation.dto.ChatMessageDTO;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class RedisSubscriber {
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    public RedisSubscriber(SimpMessagingTemplate messagingTemplate,
                           ObjectMapper objectMapper) {
        this.messagingTemplate = messagingTemplate;
        this.objectMapper = objectMapper;
    }

    public void handleMessage(String messageJson) throws Exception {
        // 📌 Añade un log aquí para verificar que se invoque
        System.out.println("🔔 RedisSubscriber got: " + messageJson);
        ChatMessageDTO msg = objectMapper.readValue(messageJson, ChatMessageDTO.class);
        System.out.println("🔔 RedisSubscriber got: " + messageJson);
        System.out.println("🛰️ Enviando a WS /user/" + msg.getReceptorId() + "/queue/messages");
        messagingTemplate.convertAndSendToUser(
                msg.getReceptorId().toString(),
                "/queue/messages",
                msg
        );
        System.out.println("✔️ Enviado al broker STOMP");
    }
}
