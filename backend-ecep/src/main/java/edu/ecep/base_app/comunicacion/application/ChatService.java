package edu.ecep.base_app.comunicacion.application;

import edu.ecep.base_app.comunicacion.domain.Mensaje;
import edu.ecep.base_app.comunicacion.infrastructure.persistence.MensajeRepository;
import edu.ecep.base_app.comunicacion.presentation.dto.ChatMessageDTO;
import edu.ecep.base_app.comunicacion.presentation.dto.SendMessageRequest;
import edu.ecep.base_app.identidad.domain.Persona;
import edu.ecep.base_app.identidad.infrastructure.persistence.PersonaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final MensajeRepository mensajeRepository;
    private final PersonaRepository personaRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    private static final String CHANNEL = "chat";
    private static final String ONLINE_USERS_KEY = "chat:online_users";
    private static final String USER_LAST_SEEN_KEY = "chat:last_seen:";

    public Mensaje saveAndSend(SendMessageRequest request, Persona emisor) {
        if (request.getContenido() == null || request.getContenido().trim().isEmpty()) {
            throw new IllegalArgumentException("El mensaje no puede estar vacío");
        }
        if (request.getContenido().length() > 1000) {
            throw new IllegalArgumentException("El mensaje es demasiado largo");
        }

        personaRepository.findById(request.getReceptorId())
                .orElseThrow(() -> new IllegalArgumentException("Persona receptora no encontrada"));

        Mensaje mensaje = new Mensaje();
        mensaje.setEmisorId(emisor.getId());
        mensaje.setReceptorId(request.getReceptorId());
        mensaje.setContenido(request.getContenido().trim());
        mensaje.setFechaEnvio(OffsetDateTime.now());
        mensaje.setLeido(false);

        Mensaje saved = mensajeRepository.save(mensaje);

        ChatMessageDTO dto = toDto(saved);
        publishMessage(dto);

        return saved;
    }

    public List<ChatMessageDTO> getHistory(Long userId, Long otherUserId) {
        return mensajeRepository
                .findConversation(userId, otherUserId)
                .stream()
                .map(this::toDto)
                .sorted(Comparator.comparing(ChatMessageDTO::getFechaEnvio))
                .collect(Collectors.toList());
    }

    public void markRead(Long userId, Long otherUserId) {
        mensajeRepository.markAsRead(userId, otherUserId);
        try {
            redisTemplate.opsForValue().set(
                    "chat:last_read:" + userId + ":" + otherUserId,
                    System.currentTimeMillis()
            );
        } catch (Exception ex) {
            log.warn("No se pudo actualizar el cache de lecturas en Redis para {}->{}, continuando", userId, otherUserId, ex);
        }
    }

    public Map<Long, Long> getUnreadCounts(Long userId) {
        return mensajeRepository.aggregateUnreadCounts(userId)
                .stream()
                .collect(Collectors.toMap(
                        MensajeRepository.UnreadCountProjection::getEmisorId,
                        MensajeRepository.UnreadCountProjection::getCount
                ));
    }

    public List<Persona> getActiveChatUsers(Long userId) {
        List<Long> activeUserIds = mensajeRepository.aggregateContactIds(userId).stream()
                .map(MensajeRepository.ContactProjection::getPersonaId)
                .toList();
        return personaRepository.findAllById(activeUserIds);
    }

    public void setUserOnline(Long userId) {
        try {
            redisTemplate.opsForSet().add(ONLINE_USERS_KEY, userId.toString());
            redisTemplate.opsForValue().set(USER_LAST_SEEN_KEY + userId, System.currentTimeMillis());
        } catch (Exception ex) {
            log.warn("No se pudo registrar al usuario {} como online en Redis", userId, ex);
        }
    }

    public void setUserOffline(Long userId) {
        try {
            redisTemplate.opsForSet().remove(ONLINE_USERS_KEY, userId.toString());
            redisTemplate.opsForValue().set(USER_LAST_SEEN_KEY + userId, System.currentTimeMillis());
        } catch (Exception ex) {
            log.warn("No se pudo registrar al usuario {} como offline en Redis", userId, ex);
        }
    }

    public Map<Long, Boolean> getOnlineStatus(List<Long> userIds) {
        try {
            return userIds.stream()
                    .collect(Collectors.toMap(
                            id -> id,
                            id -> Boolean.TRUE.equals(redisTemplate.opsForSet().isMember(ONLINE_USERS_KEY, id.toString()))
                    ));
        } catch (Exception ex) {
            log.warn("No se pudo consultar el estado online en Redis, devolviendo todo como offline", ex);
            return userIds.stream().collect(Collectors.toMap(id -> id, id -> Boolean.FALSE));
        }
    }

    public List<Long> getUserContacts(Long userId) {
        return mensajeRepository.aggregateContactIds(userId).stream()
                .map(MensajeRepository.ContactProjection::getPersonaId)
                .toList();
    }

    public ChatMessageDTO toDto(Mensaje mensaje) {
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setId(mensaje.getId());
        dto.setEmisorId(mensaje.getEmisorId());
        dto.setReceptorId(mensaje.getReceptorId());
        dto.setContenido(mensaje.getContenido());
        dto.setFechaEnvio(mensaje.getFechaEnvio());
        dto.setLeido(Boolean.TRUE.equals(mensaje.getLeido()));
        return dto;
    }

    private void publishMessage(ChatMessageDTO dto) {
        try {
            redisTemplate.convertAndSend(CHANNEL, dto);
        } catch (Exception ex) {
            log.warn("No se pudo publicar el mensaje en Redis, usando envío directo", ex);
            try {
                messagingTemplate.convertAndSendToUser(
                        dto.getReceptorId().toString(),
                        "/queue/messages",
                        dto
                );
            } catch (Exception fallbackEx) {
                log.error("Falló el envío directo del mensaje {}", dto.getId(), fallbackEx);
            }
        }
    }
}
