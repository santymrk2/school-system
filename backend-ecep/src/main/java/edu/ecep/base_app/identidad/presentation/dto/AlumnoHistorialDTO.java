package edu.ecep.base_app.identidad.presentation.dto;

import edu.ecep.base_app.identidad.domain.enums.EstadoHistorialAlumno;
import edu.ecep.base_app.vidaescolar.presentation.dto.SolicitudBajaAlumnoDTO;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlumnoHistorialDTO {
    Long alumnoId;
    Long matriculaId;
    Long solicitudBajaId;
    String alumnoNombre;
    String alumnoApellido;
    String alumnoDni;
    @NotNull
    EstadoHistorialAlumno estado;
    String detalle;
    OffsetDateTime fechaRegistro;
    String seccionNombre;
    Integer periodoEscolarAnio;
    SolicitudBajaAlumnoDTO solicitudBaja;
}

