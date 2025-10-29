package edu.ecep.base_app.comunicacion.domain;

import edu.ecep.base_app.comunicacion.domain.enums.AlcanceComunicado;
import edu.ecep.base_app.shared.domain.BaseDocument;
import edu.ecep.base_app.shared.domain.enums.NivelAcademico;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.OffsetDateTime;

/**
 * Documento Mongo que representa un comunicado institucional.
 */
@Getter
@Setter
@Document(collection = "comunicados")
@CompoundIndexes({
        @CompoundIndex(name = "alcance_activo_idx", def = "{ 'alcance': 1, 'activo': 1 }"),
        @CompoundIndex(name = "seccion_activo_idx", def = "{ 'seccion_id': 1, 'activo': 1 }", sparse = true)
})
public class Comunicado extends BaseDocument {

    @Field("alcance")
    private AlcanceComunicado alcance;

    @Field("seccion_id")
    private Long seccionId;

    @Field("nivel")
    private NivelAcademico nivel;

    @Field("titulo")
    @Indexed
    private String titulo;

    @Field("cuerpo")
    private String cuerpo;

    @Field("fecha_prog_publicacion")
    private OffsetDateTime fechaProgPublicacion;

    @Field("publicado")
    private boolean publicado = false;
}
