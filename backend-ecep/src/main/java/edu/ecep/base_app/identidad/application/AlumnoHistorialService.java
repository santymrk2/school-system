package edu.ecep.base_app.identidad.application;

import edu.ecep.base_app.identidad.domain.Alumno;
import edu.ecep.base_app.identidad.domain.enums.EstadoHistorialAlumno;
import edu.ecep.base_app.identidad.presentation.dto.AlumnoHistorialDTO;
import edu.ecep.base_app.shared.domain.enums.NivelAcademico;
import edu.ecep.base_app.vidaescolar.domain.Matricula;
import edu.ecep.base_app.vidaescolar.domain.MatriculaSeccionHistorial;
import edu.ecep.base_app.vidaescolar.domain.SolicitudBajaAlumno;
import edu.ecep.base_app.vidaescolar.domain.enums.EstadoSolicitudBaja;
import edu.ecep.base_app.vidaescolar.infrastructure.mapper.SolicitudBajaAlumnoMapper;
import edu.ecep.base_app.vidaescolar.infrastructure.persistence.MatriculaSeccionHistorialRepository;
import edu.ecep.base_app.vidaescolar.infrastructure.persistence.SolicitudBajaAlumnoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AlumnoHistorialService {

    private static final String GRADO_FINAL_PRIMARIO = "6°";

    private final SolicitudBajaAlumnoRepository solicitudBajaAlumnoRepository;
    private final SolicitudBajaAlumnoMapper solicitudBajaAlumnoMapper;
    private final MatriculaSeccionHistorialRepository historialRepository;

    @Transactional(Transactional.TxType.SUPPORTS)
    public List<AlumnoHistorialDTO> findHistorialCompleto() {
        LocalDate hoy = LocalDate.now();
        List<AlumnoHistorialDTO> resultado = new ArrayList<>();
        Set<Long> alumnosProcesados = new HashSet<>();

        // 1) Bajas aprobadas
        List<SolicitudBajaAlumno> bajas =
                solicitudBajaAlumnoRepository.findAllByEstadoOrderByFechaDecisionDesc(EstadoSolicitudBaja.APROBADA);
        for (SolicitudBajaAlumno solicitud : bajas) {
            AlumnoHistorialDTO dto = mapDesdeSolicitudBaja(solicitud);
            resultado.add(dto);
            if (dto.getAlumnoId() != null) {
                alumnosProcesados.add(dto.getAlumnoId());
            }
        }

        // 2) Egresados (terminados) de 6° grado
        Map<Long, MatriculaSeccionHistorial> ultimoHistorialPorAlumno = new HashMap<>();
        Map<Long, Boolean> matriculaTieneAsignacionVigente = new HashMap<>();

        List<MatriculaSeccionHistorial> historialesFinales =
                historialRepository.findByNivelAndGradoFinalizados(NivelAcademico.PRIMARIO, GRADO_FINAL_PRIMARIO);

        for (MatriculaSeccionHistorial historial : historialesFinales) {
            Matricula matricula = historial.getMatricula();
            if (matricula == null) {
                continue;
            }
            Alumno alumno = matricula.getAlumno();
            if (alumno == null) {
                continue;
            }
            Long alumnoId = alumno.getId();
            if (alumnoId == null || alumnosProcesados.contains(alumnoId)) {
                continue;
            }

            Long matriculaId = matricula.getId();
            if (matriculaId == null) {
                continue;
            }

            boolean tieneVigente = matriculaTieneAsignacionVigente.computeIfAbsent(
                    matriculaId,
                    id -> !historialRepository.findVigente(id, hoy).isEmpty());
            if (tieneVigente) {
                // Alumno aún tiene sección vigente: no se considera egresado
                continue;
            }

            ultimoHistorialPorAlumno.merge(
                    alumnoId,
                    historial,
                    (existente, candidato) ->
                            fechaHistorial(candidato).isAfter(fechaHistorial(existente)) ? candidato : existente);
        }

        for (MatriculaSeccionHistorial historial : ultimoHistorialPorAlumno.values()) {
            AlumnoHistorialDTO dto = mapDesdeHistorialFinal(historial);
            resultado.add(dto);
            if (dto.getAlumnoId() != null) {
                alumnosProcesados.add(dto.getAlumnoId());
            }
        }

        resultado.sort(Comparator
                .comparing(AlumnoHistorialDTO::getFechaRegistro,
                        Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(AlumnoHistorialDTO::getAlumnoApellido, Comparator.nullsLast(String::compareToIgnoreCase))
                .thenComparing(AlumnoHistorialDTO::getAlumnoNombre, Comparator.nullsLast(String::compareToIgnoreCase)));

        return resultado;
    }

    private AlumnoHistorialDTO mapDesdeSolicitudBaja(SolicitudBajaAlumno solicitud) {
        Matricula matricula = solicitud.getMatricula();
        Alumno alumno = matricula != null ? matricula.getAlumno() : null;
        var persona = alumno != null ? alumno.getPersona() : null;

        AlumnoHistorialDTO dto = new AlumnoHistorialDTO();
        dto.setAlumnoId(alumno != null ? alumno.getId() : null);
        dto.setMatriculaId(matricula != null ? matricula.getId() : null);
        dto.setSolicitudBajaId(solicitud.getId());
        dto.setAlumnoNombre(persona != null ? persona.getNombre() : null);
        dto.setAlumnoApellido(persona != null ? persona.getApellido() : null);
        dto.setAlumnoDni(persona != null ? persona.getDni() : null);
        dto.setEstado(EstadoHistorialAlumno.BAJA);
        dto.setDetalle(normalize(solicitud.getMotivo()));
        dto.setFechaRegistro(solicitud.getFechaDecision());
        dto.setSeccionNombre(resolveSeccionNombre(matricula, solicitud.getFechaDecision()));
        dto.setPeriodoEscolarAnio(
                matricula != null && matricula.getPeriodoEscolar() != null
                        ? matricula.getPeriodoEscolar().getAnio()
                        : null);
        dto.setSolicitudBaja(solicitudBajaAlumnoMapper.toDto(solicitud));
        return dto;
    }

    private AlumnoHistorialDTO mapDesdeHistorialFinal(MatriculaSeccionHistorial historial) {
        Matricula matricula = historial.getMatricula();
        Alumno alumno = matricula != null ? matricula.getAlumno() : null;
        var persona = alumno != null ? alumno.getPersona() : null;

        LocalDate fecha = fechaHistorial(historial);
        OffsetDateTime fechaRegistro = fecha != null
                ? fecha.atStartOfDay(ZoneId.systemDefault()).toOffsetDateTime()
                : null;

        AlumnoHistorialDTO dto = new AlumnoHistorialDTO();
        dto.setAlumnoId(alumno != null ? alumno.getId() : null);
        dto.setMatriculaId(matricula != null ? matricula.getId() : null);
        dto.setSolicitudBajaId(null);
        dto.setAlumnoNombre(persona != null ? persona.getNombre() : null);
        dto.setAlumnoApellido(persona != null ? persona.getApellido() : null);
        dto.setAlumnoDni(persona != null ? persona.getDni() : null);
        dto.setEstado(EstadoHistorialAlumno.TERMINADO);
        dto.setDetalle("Finalizó " + buildSeccionNombre(historial));
        dto.setFechaRegistro(fechaRegistro);
        dto.setSeccionNombre(buildSeccionNombre(historial));
        dto.setPeriodoEscolarAnio(
                matricula != null && matricula.getPeriodoEscolar() != null
                        ? matricula.getPeriodoEscolar().getAnio()
                        : null);
        dto.setSolicitudBaja(null);
        return dto;
    }

    private LocalDate fechaHistorial(MatriculaSeccionHistorial historial) {
        LocalDate hasta = historial.getHasta();
        if (hasta != null) {
            return hasta;
        }
        return historial.getDesde();
    }

    private String buildSeccionNombre(MatriculaSeccionHistorial historial) {
        if (historial == null || historial.getSeccion() == null) {
            return null;
        }
        var seccion = historial.getSeccion();
        StringBuilder sb = new StringBuilder();
        if (seccion.getGradoSala() != null) {
            sb.append(seccion.getGradoSala());
        }
        if (seccion.getDivision() != null && !seccion.getDivision().isBlank()) {
            if (sb.length() > 0) {
                sb.append(" ");
            }
            sb.append(seccion.getDivision());
        }
        return sb.length() == 0 ? null : sb.toString();
    }

    private String resolveSeccionNombre(Matricula matricula, OffsetDateTime fechaDecision) {
        if (matricula == null || matricula.getId() == null) {
            return null;
        }
        LocalDate fecha = fechaDecision != null ? fechaDecision.toLocalDate() : LocalDate.now();
        List<MatriculaSeccionHistorial> vigentes = historialRepository.findVigente(matricula.getId(), fecha);
        if (vigentes.isEmpty()) {
            return null;
        }
        return buildSeccionNombre(vigentes.get(0));
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}

