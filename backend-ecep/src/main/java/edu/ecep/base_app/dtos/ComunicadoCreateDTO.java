package edu.ecep.base_app.dtos;

import edu.ecep.base_app.domain.enums.AlcanceComunicado;
import edu.ecep.base_app.domain.enums.NivelAcademico;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComunicadoCreateDTO {
    @NotNull
    AlcanceComunicado alcance;
    Long seccionId;
    NivelAcademico nivel;
    @NotBlank
    String titulo;
    @NotBlank
    String cuerpo;
    OffsetDateTime fechaProgPublicacion;
}
