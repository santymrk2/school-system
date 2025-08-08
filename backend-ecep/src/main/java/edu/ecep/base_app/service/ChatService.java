package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.Mensaje;
import edu.ecep.base_app.domain.Usuario;
import edu.ecep.base_app.dtos.ChatMessageDTO;
import edu.ecep.base_app.dtos.SendMessageRequest;
import edu.ecep.base_app.repos.MensajeRepository;
import edu.ecep.base_app.repos.UsuarioRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatService {

    private final MensajeRepository mensajeRepository;
    private final UsuarioRepository usuarioRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String CHANNEL = "chat";
    private static final String ONLINE_USERS_KEY = "chat:online_users";
    private static final String USER_LAST_SEEN_KEY = "chat:last_seen:";

    /**
     * Guarda el mensaje en la BD y lo publica por Redis para su diseminación.
     */
    public Mensaje saveAndSend(SendMessageRequest request, Usuario emisor) {
        // Validaciones
        if (request.getContenido() == null || request.getContenido().trim().isEmpty()) {
            throw new IllegalArgumentException("El mensaje no puede estar vacío");
        }
        if (request.getContenido().length() > 1000) {
            throw new IllegalArgumentException("El mensaje es demasiado largo");
        }

        // Creación de entidad
        Mensaje mensaje = new Mensaje();
        mensaje.setEmisor(emisor);
        mensaje.setReceptor(usuarioRepository.findById(request.getReceptorId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario receptor no encontrado")));
        mensaje.setContenido(request.getContenido().trim());
        mensaje.setFechaEnvio(OffsetDateTime.now());
        mensaje.setLeido(false);

        // Persistir en BD
        Mensaje saved = mensajeRepository.save(mensaje);

        // Convertir a DTO y publicar en Redis
        ChatMessageDTO dto = toDto(saved);
        redisTemplate.convertAndSend(CHANNEL, dto);

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
        redisTemplate.opsForValue().set(
                "chat:last_read:" + userId + ":" + otherUserId,
                System.currentTimeMillis()
        );
    }

    public Map<Long, Long> getUnreadCounts(Long userId) {
        return mensajeRepository.getUnreadCounts(userId)
                .stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));
    }

    public List<Usuario> getActiveChatUsers(Long userId) {
        List<Long> activeUserIds = mensajeRepository.getActiveChatUserIds(userId);
        return usuarioRepository.findAllById(activeUserIds);
    }

    public void setUserOnline(Long userId) {
        redisTemplate.opsForSet().add(ONLINE_USERS_KEY, userId.toString());
        redisTemplate.opsForValue().set(USER_LAST_SEEN_KEY + userId, System.currentTimeMillis());
    }

    public void setUserOffline(Long userId) {
        redisTemplate.opsForSet().remove(ONLINE_USERS_KEY, userId.toString());
        redisTemplate.opsForValue().set(USER_LAST_SEEN_KEY + userId, System.currentTimeMillis());
    }

    public Map<Long, Boolean> getOnlineStatus(List<Long> userIds) {
        return userIds.stream()
                .collect(Collectors.toMap(
                        id -> id,
                        id -> redisTemplate.opsForSet().isMember(ONLINE_USERS_KEY, id.toString())
                ));
    }

    public List<Long> getUserContacts(Long userId) {
        return mensajeRepository.getUserContacts(userId);
    }

    /** Convierte la entidad Mensaje a ChatMessageDTO */
    public ChatMessageDTO toDto(Mensaje mensaje) {
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setId(mensaje.getId());
        dto.setEmisorId(mensaje.getEmisor().getId());
        dto.setReceptorId(mensaje.getReceptor().getId());
        dto.setContenido(mensaje.getContenido());
        dto.setFechaEnvio(mensaje.getFechaEnvio());
        dto.setLeido(mensaje.getLeido());
        return dto;
    }
}
