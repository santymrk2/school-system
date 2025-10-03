package edu.ecep.base_app.vidaescolar.application;

import edu.ecep.base_app.shared.exception.NotFoundException;
import edu.ecep.base_app.vidaescolar.domain.SolicitudBajaAlumno;
import edu.ecep.base_app.vidaescolar.domain.enums.EstadoRevisionAdministrativa;
import edu.ecep.base_app.vidaescolar.domain.enums.EstadoSolicitudBaja;
import edu.ecep.base_app.vidaescolar.infrastructure.mapper.SolicitudBajaAlumnoMapper;
import edu.ecep.base_app.vidaescolar.infrastructure.persistence.SolicitudBajaAlumnoRepository;
import edu.ecep.base_app.vidaescolar.presentation.dto.SolicitudBajaAlumnoCreateDTO;
import edu.ecep.base_app.vidaescolar.presentation.dto.SolicitudBajaAlumnoDTO;
import edu.ecep.base_app.vidaescolar.presentation.dto.SolicitudBajaAlumnoDecisionDTO;
import edu.ecep.base_app.vidaescolar.presentation.dto.SolicitudBajaAlumnoRechazoDTO;
import edu.ecep.base_app.vidaescolar.presentation.dto.SolicitudBajaAlumnoRevisionAdministrativaDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SolicitudBajaAlumnoService {
    private final SolicitudBajaAlumnoRepository repo;
    private final SolicitudBajaAlumnoMapper mapper;

    @Transactional(readOnly = true)
    public List<SolicitudBajaAlumnoDTO> findAll() {
        return repo.findAll().stream().map(mapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<SolicitudBajaAlumnoDTO> findHistorial() {
        return repo
                .findAllByEstadoOrderByFechaDecisionDesc(EstadoSolicitudBaja.APROBADA)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @Transactional
    public Long create(SolicitudBajaAlumnoCreateDTO dto) {
        return repo.save(mapper.toEntity(dto)).getId();
    }

    @Transactional
    public void aprobar(Long id, SolicitudBajaAlumnoDecisionDTO dto) {
        SolicitudBajaAlumno solicitud = obtenerPendiente(id);

        validarRevisionAdministrativaRealizada(solicitud);

        if (!StringUtils.hasText(solicitud.getMotivo())) {
            throw new IllegalStateException("La solicitud debe tener un motivo registrado antes de aprobarla");
        }

        Long personaDecisorId = requirePersonaDecisor(dto.getDecididoPorPersonaId());

        solicitud.setEstado(EstadoSolicitudBaja.APROBADA);
        solicitud.setMotivoRechazo(null);
        solicitud.setDecididoPorPersonaId(personaDecisorId);
        solicitud.setFechaDecision(OffsetDateTime.now());
    }

    @Transactional
    public void rechazar(Long id, SolicitudBajaAlumnoRechazoDTO dto) {
        SolicitudBajaAlumno solicitud = obtenerPendiente(id);

        validarRevisionAdministrativaRealizada(solicitud);

        if (!StringUtils.hasText(dto.getMotivoRechazo())) {
            throw new IllegalArgumentException("Debe indicar un motivo de rechazo");
        }

        Long personaDecisorId = requirePersonaDecisor(dto.getDecididoPorPersonaId());
        solicitud.setEstado(EstadoSolicitudBaja.RECHAZADA);
        solicitud.setMotivoRechazo(dto.getMotivoRechazo().trim());
        solicitud.setDecididoPorPersonaId(personaDecisorId);
        solicitud.setFechaDecision(OffsetDateTime.now());
    }

    @Transactional
    public void registrarRevisionAdministrativa(
            Long id, SolicitudBajaAlumnoRevisionAdministrativaDTO dto) {
        SolicitudBajaAlumno solicitud = obtenerPendiente(id);

        if (solicitud.getEstadoRevisionAdministrativa() != EstadoRevisionAdministrativa.PENDIENTE) {
            throw new IllegalStateException("La solicitud ya fue revisada por administración");
        }

        Long personaRevisoraId = requirePersonaRevisora(dto.getRevisadoPorPersonaId());

        EstadoRevisionAdministrativa nuevoEstado = dto.getEstadoRevisionAdministrativa();
        if (nuevoEstado == null) {
            throw new IllegalArgumentException("Debe indicar el resultado de la revisión administrativa");
        }

        String observacion =
                StringUtils.hasText(dto.getObservacionRevisionAdministrativa())
                        ? dto.getObservacionRevisionAdministrativa().trim()
                        : null;

        if (nuevoEstado == EstadoRevisionAdministrativa.DEUDAS_INFORMADAS && !StringUtils.hasText(observacion)) {
            throw new IllegalArgumentException(
                    "Debe detallar las observaciones cuando se informan deudas");
        }

        solicitud.setEstadoRevisionAdministrativa(nuevoEstado);
        solicitud.setObservacionRevisionAdministrativa(observacion);
        solicitud.setRevisadoAdministrativamentePorPersonaId(personaRevisoraId);
        solicitud.setFechaRevisionAdministrativa(OffsetDateTime.now());
    }

    private Long requirePersonaDecisor(Long personaDecisorId) {
        return requirePersona(personaDecisorId, "Debe indicar la persona que decide la solicitud");
    }

    private Long requirePersonaRevisora(Long personaRevisoraId) {
        return requirePersona(
                personaRevisoraId, "Debe indicar la persona que revisa administrativamente la solicitud");
    }

    private Long requirePersona(Long personaId, String message) {
        if (personaId == null) {
            throw new IllegalArgumentException(message);
        }
        return personaId;
    }

    private SolicitudBajaAlumno obtenerPendiente(Long id) {
        SolicitudBajaAlumno solicitud =
                repo.findById(id).orElseThrow(() -> new NotFoundException("Solicitud de baja no encontrada"));

        if (solicitud.getEstado() != EstadoSolicitudBaja.PENDIENTE) {
            throw new IllegalStateException("La solicitud ya fue procesada");
        }

        return solicitud;
    }

    private void validarRevisionAdministrativaRealizada(SolicitudBajaAlumno solicitud) {
        if (solicitud.getEstadoRevisionAdministrativa() == EstadoRevisionAdministrativa.PENDIENTE) {
            throw new IllegalStateException(
                    "La solicitud debe contar con la revisión administrativa antes de tomar una decisión");
        }
    }
}
