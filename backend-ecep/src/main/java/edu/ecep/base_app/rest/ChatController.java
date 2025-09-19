package edu.ecep.base_app.rest;

import edu.ecep.base_app.domain.Persona;
import edu.ecep.base_app.dtos.ChatMessageDTO;
import edu.ecep.base_app.dtos.PersonaResumenDTO;
import edu.ecep.base_app.service.ChatService;
import edu.ecep.base_app.service.PersonaAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;
    private final PersonaAccountService personaAccountService;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/history/{otherPersonaId}")
    public ResponseEntity<List<ChatMessageDTO>> history(@PathVariable Long otherPersonaId) {
        try {
            Persona me = personaAccountService.getCurrentPersona();
            List<ChatMessageDTO> messages = chatService.getHistory(me.getId(), otherPersonaId);
            return ResponseEntity.ok(messages);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).build();
        }
    }

    @PostMapping("/mark-read/{otherPersonaId}")
    public ResponseEntity<Void> markRead(@PathVariable Long otherPersonaId) {
        try {
            Persona me = personaAccountService.getCurrentPersona();
            chatService.markRead(me.getId(), otherPersonaId);

            messagingTemplate.convertAndSendToUser(
                    String.valueOf(otherPersonaId),
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
    public ResponseEntity<List<PersonaResumenDTO>> getActiveChats() {
        try {
            Persona me = personaAccountService.getCurrentPersona();
            List<Persona> active = chatService.getActiveChatUsers(me.getId());
            List<PersonaResumenDTO> dtos = active.stream()
                    .map(personaAccountService::toResumen)
                    .toList();
            return ResponseEntity.ok(dtos);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).build();
        }
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<Long, Long>> getUnreadCounts() {
        try {
            Persona me = personaAccountService.getCurrentPersona();
            Map<Long, Long> unreadCounts = chatService.getUnreadCounts(me.getId());
            return ResponseEntity.ok(unreadCounts);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).build();
        }
    }

    @GetMapping("/online-status")
    public ResponseEntity<Map<Long, Boolean>> getOnlineStatus(@RequestParam List<Long> personaIds) {
        try {
            Map<Long, Boolean> onlineStatus = chatService.getOnlineStatus(personaIds);
            return ResponseEntity.ok(onlineStatus);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
