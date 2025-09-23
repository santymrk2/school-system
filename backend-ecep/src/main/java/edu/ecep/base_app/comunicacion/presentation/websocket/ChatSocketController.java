package edu.ecep.base_app.comunicacion.presentation.websocket;

import edu.ecep.base_app.comunicacion.domain.Mensaje;
import edu.ecep.base_app.identidad.domain.Persona;
import edu.ecep.base_app.comunicacion.presentation.dto.ChatMessageDTO;
import edu.ecep.base_app.comunicacion.presentation.dto.SendMessageRequest;
import edu.ecep.base_app.comunicacion.presentation.dto.TypingNotificationDTO;
import edu.ecep.base_app.comunicacion.application.ChatService;
import edu.ecep.base_app.identidad.application.PersonaAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatSocketController {

    private final ChatService chatService;
    private final PersonaAccountService personaAccountService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    @SendToUser("/queue/ack")
    public ChatMessageDTO send(
            @Payload SendMessageRequest req,
            Principal principal
    ) {
        Persona emisor = personaAccountService.getPersonaById(Long.valueOf(principal.getName()));
        Mensaje saved = chatService.saveAndSend(req, emisor);
        return chatService.toDto(saved);
    }

    @MessageMapping("/chat.typing")
    public void typing(
            @Payload TypingNotificationDTO notification,
            Principal principal
    ) {
        if (notification == null || notification.getReceptorId() == null) {
            log.debug("Typing notification inválida: {}", notification);
            return;
        }

        if (principal == null) {
            log.warn("Evento typing sin principal asociado");
            return;
        }

        Long senderId = Long.valueOf(principal.getName());
        messagingTemplate.convertAndSendToUser(
                String.valueOf(notification.getReceptorId()),
                "/queue/typing",
                Map.of(
                        "userId", senderId,
                        "typing", notification.isTyping()
                )
        );
    }
}
