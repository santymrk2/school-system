package edu.ecep.base_app.comunicacion.presentation.dto;

import edu.ecep.base_app.comunicacion.domain.enums.AlcanceComunicado;
import edu.ecep.base_app.shared.domain.enums.NivelAcademico;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

// =============================================================
// 6) Comunicaciones (sin tracking)
// =============================================================
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComunicadoDTO {
    String id;
    @NotNull
    AlcanceComunicado alcance;
    Long seccionId;
    NivelAcademico nivel;
    @NotBlank
    String titulo;
    @NotBlank
    String cuerpo;
    OffsetDateTime fechaProgPublicacion;
    boolean publicado;
    OffsetDateTime fechaCreacion;
}
