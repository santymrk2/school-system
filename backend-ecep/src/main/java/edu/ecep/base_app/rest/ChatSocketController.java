package edu.ecep.base_app.rest;

import edu.ecep.base_app.domain.Mensaje;
import edu.ecep.base_app.domain.Persona;
import edu.ecep.base_app.dtos.ChatMessageDTO;
import edu.ecep.base_app.dtos.SendMessageRequest;
import edu.ecep.base_app.service.ChatService;
import edu.ecep.base_app.service.PersonaAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatSocketController {

    private final ChatService chatService;
    private final PersonaAccountService personaAccountService;

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
}
