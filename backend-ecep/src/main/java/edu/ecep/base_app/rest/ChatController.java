package edu.ecep.base_app.rest;

import edu.ecep.base_app.domain.Usuario;
import edu.ecep.base_app.dtos.ChatMessageDTO;
import edu.ecep.base_app.dtos.UsuarioBusquedaDTO;
import edu.ecep.base_app.service.ChatService;
import edu.ecep.base_app.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;
    private final UsuarioService usuarioService;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/history/{otherUserId}")
    public ResponseEntity<List<ChatMessageDTO>> history(@PathVariable Long otherUserId) {
        try {
            Usuario me = usuarioService.getCurrent();
            List<ChatMessageDTO> messages = chatService.getHistory(me.getId(), otherUserId);
            return ResponseEntity.ok(messages);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).build();
        }
    }

    @PostMapping("/mark-read/{otherUserId}")
    public ResponseEntity<Void> markRead(@PathVariable Long otherUserId) {
        try {
            Usuario me = usuarioService.getCurrent();
            chatService.markRead(me.getId(), otherUserId);

            // Notificar al otro usuario que los mensajes fueron leídos
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(otherUserId),
                    "/queue/read-receipts",
                    Map.of(
                            "readerId", me.getId(),
                            "timestamp", System.currentTimeMillis()
                    )
            );

            return ResponseEntity.noContent().build();
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).build();
        }
    }

    @GetMapping("/active-chats")
    public ResponseEntity<List<UsuarioBusquedaDTO>> getActiveChats() {
        Usuario me = usuarioService.getCurrent();
        List<Usuario> activeUsers = chatService.getActiveChatUsers(me.getId());

        List<UsuarioBusquedaDTO> dtos = activeUsers.stream()
                .map(u -> usuarioService.buscarUsuarioBusquedaPorId(u.getId()))
                .toList();

        return ResponseEntity.ok(dtos);
    }

    // Nuevo endpoint para obtener mensajes no leídos
    @GetMapping("/unread-count")
    public ResponseEntity<Map<Long, Long>> getUnreadCounts() {
        try {
            Usuario me = usuarioService.getCurrent();
            Map<Long, Long> unreadCounts = chatService.getUnreadCounts(me.getId());
            return ResponseEntity.ok(unreadCounts);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).build();
        }
    }

    // Endpoint para obtener estado de conexión de usuarios
    @GetMapping("/online-status")
    public ResponseEntity<Map<Long, Boolean>> getOnlineStatus(@RequestParam List<Long> userIds) {
        try {
            Map<Long, Boolean> onlineStatus = chatService.getOnlineStatus(userIds);
            return ResponseEntity.ok(onlineStatus);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}