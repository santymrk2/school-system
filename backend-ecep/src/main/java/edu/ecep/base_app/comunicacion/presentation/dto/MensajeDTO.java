package edu.ecep.base_app.comunicacion.presentation.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MensajeDTO {

    private String id;

    @NotNull
    private OffsetDateTime fechaEnvio;

    @Size(max = 255)
    private String asunto;

    @NotNull
    private String contenido;

    @NotNull
    private Boolean leido;

    @NotNull
    private Long emisor;

    @NotNull
    private Long receptor;

}
