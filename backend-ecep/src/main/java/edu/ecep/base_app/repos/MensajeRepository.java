package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.Mensaje;
import edu.ecep.base_app.domain.Usuario;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface MensajeRepository extends JpaRepository<Mensaje, Long> {

    // Obtener conversación entre dos usuarios ordenada por fecha
    @Query("""
        SELECT m FROM Mensaje m 
        WHERE (m.emisor.id = :userId AND m.receptor.id = :otherUserId) 
           OR (m.emisor.id = :otherUserId AND m.receptor.id = :userId)
        ORDER BY m.fechaEnvio ASC
        """)
    List<Mensaje> findConversation(@Param("userId") Long userId, @Param("otherUserId") Long otherUserId);

    // Marcar mensajes como leídos
    @Modifying
    @Query("""
        UPDATE Mensaje m 
        SET m.leido = true 
        WHERE m.emisor.id = :otherUserId 
          AND m.receptor.id = :userId 
          AND m.leido = false
        """)
    void markAsRead(@Param("userId") Long userId, @Param("otherUserId") Long otherUserId);

    // Obtener conteo de mensajes no leídos por emisor
    @Query("""
        SELECT m.emisor.id, COUNT(m) 
        FROM Mensaje m 
        WHERE m.receptor.id = :userId 
          AND m.leido = false 
        GROUP BY m.emisor.id
        """)
    List<Object[]> getUnreadCounts(@Param("userId") Long userId);

    // Obtener usuarios con los que se ha tenido conversación
    @Query("""
        SELECT DISTINCT 
        CASE 
            WHEN m.emisor.id = :userId THEN m.receptor.id 
            ELSE m.emisor.id 
        END
        FROM Mensaje m 
        WHERE m.emisor.id = :userId OR m.receptor.id = :userId
        """)
    List<Long> getActiveChatUserIds(@Param("userId") Long userId);

    // Obtener contactos de un usuario (redundante con el anterior)
    @Query("""
        SELECT DISTINCT 
        CASE 
            WHEN m.emisor.id = :userId THEN m.receptor.id 
            ELSE m.emisor.id 
        END
        FROM Mensaje m 
        WHERE m.emisor.id = :userId OR m.receptor.id = :userId
        """)
    List<Long> getUserContacts(@Param("userId") Long userId);

    // Obtener último mensaje entre dos usuarios
    @Query("""
        SELECT m FROM Mensaje m 
        WHERE (m.emisor.id = :userId AND m.receptor.id = :otherUserId) 
           OR (m.emisor.id = :otherUserId AND m.receptor.id = :userId)
        ORDER BY m.fechaEnvio DESC
        """)
    List<Mensaje> findLastMessage(@Param("userId") Long userId, @Param("otherUserId") Long otherUserId, Pageable pageable);


    // Obtener mensajes no leídos de una conversación específica
    @Query("""
        SELECT m FROM Mensaje m 
        WHERE m.emisor.id = :otherUserId 
          AND m.receptor.id = :userId 
          AND m.leido = false
        ORDER BY m.fechaEnvio ASC
        """)
    List<Mensaje> findUnreadMessages(@Param("userId") Long userId, @Param("otherUserId") Long otherUserId);

    // Verificar si hay mensajes no leídos entre dos usuarios
    @Query("""
        SELECT COUNT(m) > 0 
        FROM Mensaje m 
        WHERE m.emisor.id = :otherUserId 
          AND m.receptor.id = :userId 
          AND m.leido = false
        """)
    boolean hasUnreadMessagesFrom(@Param("userId") Long userId, @Param("otherUserId") Long otherUserId);

    // Obtener estadísticas de mensajes
    @Query("""
        SELECT 
            COUNT(m),
            SUM(CASE WHEN m.leido = false AND m.receptor.id = :userId THEN 1 ELSE 0 END),
            MAX(m.fechaEnvio)
        FROM Mensaje m 
        WHERE m.emisor.id = :userId OR m.receptor.id = :userId
        """)
    Object[] getMessageStats(@Param("userId") Long userId);
}
