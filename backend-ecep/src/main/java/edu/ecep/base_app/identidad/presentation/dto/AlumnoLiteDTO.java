package edu.ecep.base_app.identidad.presentation.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import edu.ecep.base_app.shared.domain.enums.NivelAcademico;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AlumnoLiteDTO(
        Long matriculaId,
        Long alumnoId,
        String nombreCompleto,
        Long seccionId,
        String seccionNombre,
        NivelAcademico nivel
) {

    public AlumnoLiteDTO(Long matriculaId, Long alumnoId, String nombreCompleto) {
        this(matriculaId, alumnoId, nombreCompleto, null, null, null);
    }
}
