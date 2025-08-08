package edu.ecep.base_app.rest;

import edu.ecep.base_app.domain.Mensaje;
import edu.ecep.base_app.domain.Usuario;
import edu.ecep.base_app.dtos.ChatMessageDTO;
import edu.ecep.base_app.dtos.SendMessageRequest;
import edu.ecep.base_app.service.ChatService;
import edu.ecep.base_app.service.UsuarioService;
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
    private final UsuarioService userService;

    @MessageMapping("/chat.send")
    @SendToUser("/queue/ack")
    public ChatMessageDTO send(
            @Payload SendMessageRequest req,
            Principal principal
    ) {
        Usuario em = userService.findById(Long.valueOf(principal.getName()));
        Mensaje saved = chatService.saveAndSend(req, em);
        return chatService.toDto(saved);
    }
}
