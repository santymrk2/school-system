package edu.ecep.base_app.comunicacion.domain;

import edu.ecep.base_app.shared.domain.BaseDocument;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.OffsetDateTime;

/**
 * Documento Mongo que representa un mensaje del chat institucional.
 */
@Getter
@Setter
@Document(collection = "mensajes")
@CompoundIndexes({
        @CompoundIndex(name = "chat_historial_idx", def = "{ 'emisor_id': 1, 'receptor_id': 1, 'fecha_envio': 1 }"),
        @CompoundIndex(name = "chat_unread_idx", def = "{ 'receptor_id': 1, 'leido': 1, 'activo': 1 }"),
        @CompoundIndex(name = "chat_unread_pair_idx", def = "{ 'emisor_id': 1, 'receptor_id': 1, 'leido': 1 }")
})
public class Mensaje extends BaseDocument {

    @Field("fecha_envio")
    private OffsetDateTime fechaEnvio;

    @Field("asunto")
    private String asunto;

    @Field("contenido")
    private String contenido;

    @Field("leido")
    @Indexed
    private Boolean leido;

    @Field("emisor_id")
    @Indexed
    private Long emisorId;

    @Field("receptor_id")
    @Indexed
    private Long receptorId;
}
