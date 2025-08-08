package edu.ecep.base_app.config;

import edu.ecep.base_app.service.ChatService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.security.Principal;

@Component
@Slf4j
public class WebSocketChannelInterceptor implements ChannelInterceptor {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketChannelInterceptor(@Lazy SimpMessagingTemplate messagingTemplate,
                                       ChatService chatService) {
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {

        StompHeaderAccessor acc = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (acc == null) return message;

        Principal principal = acc.getUser();
        if (principal == null) {
            log.warn("Intento de conexión WebSocket sin autenticación");
            return message;
        }

        Long userId = Long.valueOf(principal.getName());

        if (StompCommand.CONNECT.equals(acc.getCommand())) {
            log.info("✅ CONNECT - Principal: {}", principal.getName());
            log.info("User connected: {}", userId);
            chatService.setUserOnline(userId);
            notifyContactsOnlineStatus(userId, true);

        } else if (StompCommand.DISCONNECT.equals(acc.getCommand())) {
            log.info("User disconnected: {}", userId);
            chatService.setUserOffline(userId);
            notifyContactsOnlineStatus(userId, false);
        }

        return message;
    }

    private void notifyContactsOnlineStatus(Long userId, boolean isOnline) {
        chatService.getUserContacts(userId).forEach(contactId ->
                messagingTemplate.convertAndSendToUser(
                        String.valueOf(contactId),
                        "/queue/online-status",
                        Map.of("userId", userId, "isOnline", isOnline)
                )
        );
    }
}
