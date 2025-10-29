package edu.ecep.base_app.comunicacion.infrastructure.persistence;

import edu.ecep.base_app.comunicacion.domain.Mensaje;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface MensajeRepository extends MongoRepository<Mensaje, String> {

    @Query(value = "{ 'activo': true, '$or': [ { 'emisor_id': ?0, 'receptor_id': ?1 }, { 'emisor_id': ?1, 'receptor_id': ?0 } ] }", sort = "{ 'fecha_envio': 1 }")
    List<Mensaje> findConversation(Long userId, Long otherUserId);

    @Query(value = "{ 'activo': true, 'emisor_id': ?1, 'receptor_id': ?0, 'leido': false }")
    @Update("{ '$set': { 'leido': true } }")
    void markAsRead(Long userId, Long otherUserId);

    @Aggregation(pipeline = {
            "{ '$match': { 'activo': true, 'receptor_id': ?0, 'leido': false } }",
            "{ '$group': { '_id': '$emisor_id', 'count': { '$sum': 1 } } }"
    })
    List<UnreadCountProjection> aggregateUnreadCounts(Long userId);

    @Aggregation(pipeline = {
            "{ '$match': { 'activo': true, '$or': [ { 'emisor_id': ?0 }, { 'receptor_id': ?0 } ] } }",
            "{ '$project': { 'contactId': { '$cond': [ { '$eq': ['$emisor_id', ?0] }, '$receptor_id', '$emisor_id' ] } } }",
            "{ '$group': { '_id': '$contactId' } }"
    })
    List<ContactProjection> aggregateContactIds(Long userId);

    @Query(value = "{ 'activo': true, '$or': [ { 'emisor_id': ?0, 'receptor_id': ?1 }, { 'emisor_id': ?1, 'receptor_id': ?0 } ] }", sort = "{ 'fecha_envio': -1 }")
    List<Mensaje> findLastMessage(Long userId, Long otherUserId, Pageable pageable);

    @Query(value = "{ 'activo': true, 'emisor_id': ?1, 'receptor_id': ?0, 'leido': false }", sort = "{ 'fecha_envio': 1 }")
    List<Mensaje> findUnreadMessages(Long userId, Long otherUserId);

    boolean existsByActivoTrueAndEmisorIdAndReceptorIdAndLeidoFalse(Long emisorId, Long receptorId);

    @Aggregation(pipeline = {
            "{ '$match': { 'activo': true, '$or': [ { 'emisor_id': ?0 }, { 'receptor_id': ?0 } ] } }",
            "{ '$group': { '_id': null, 'total': { '$sum': 1 }, 'unread': { '$sum': { '$cond': [ { '$and': [ { '$eq': ['$leido', false] }, { '$eq': ['$receptor_id', ?0] } ] }, 1, 0 ] } }, 'lastSent': { '$max': '$fecha_envio' } } }"
    })
    Optional<MessageStatsProjection> aggregateStats(Long userId);

    interface UnreadCountProjection {
        @Value("#{target._id}")
        Long getEmisorId();
        Long getCount();
    }

    interface ContactProjection {
        @Value("#{target._id}")
        Long getPersonaId();
    }

    interface MessageStatsProjection {
        Long getTotal();
        Long getUnread();
        OffsetDateTime getLastSent();
    }
}
