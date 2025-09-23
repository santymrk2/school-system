package edu.ecep.base_app.admisiones.application;

import edu.ecep.base_app.admisiones.domain.Aspirante;
import edu.ecep.base_app.identidad.domain.Persona;
import edu.ecep.base_app.admisiones.domain.SolicitudAdmision;
import edu.ecep.base_app.admisiones.presentation.dto.SolicitudAdmisionDTO;
import edu.ecep.base_app.admisiones.presentation.dto.SolicitudAdmisionDecisionDTO;
import edu.ecep.base_app.admisiones.presentation.dto.SolicitudAdmisionEntrevistaDTO;
import edu.ecep.base_app.admisiones.presentation.dto.SolicitudAdmisionProgramarDTO;
import edu.ecep.base_app.admisiones.presentation.dto.SolicitudAdmisionRechazoDTO;
import edu.ecep.base_app.admisiones.presentation.dto.SolicitudAdmisionSeleccionDTO;
import edu.ecep.base_app.admisiones.infrastructure.mapper.SolicitudAdmisionMapper;
import edu.ecep.base_app.admisiones.infrastructure.persistence.SolicitudAdmisionRepository;
import edu.ecep.base_app.shared.exception.NotFoundException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@Slf4j
@RequiredArgsConstructor
public class SolicitudAdmisionService {
    private static final String ESTADO_PENDIENTE = "PENDIENTE";
    private static final String ESTADO_PROPUESTA = "PROPUESTA_ENVIADA";
    private static final String ESTADO_PROGRAMADA = "ENTREVISTA_PROGRAMADA";
    private static final String ESTADO_ENTREVISTA_REALIZADA = "ENTREVISTA_REALIZADA";
    private static final String ESTADO_ACEPTADA = "ACEPTADA";
    private static final String ESTADO_RECHAZADA = "RECHAZADA";

    private final SolicitudAdmisionRepository repository;
    private final SolicitudAdmisionMapper mapper;

    public List<SolicitudAdmisionDTO> findAll() {
        return repository.findAll(Sort.by("id").descending())
                .stream()
                .map(this::toDto)
                .toList();
    }

    public SolicitudAdmisionDTO get(Long id) {
        SolicitudAdmision entity = repository.findById(id).orElseThrow(NotFoundException::new);
        return toDto(entity);
    }

    public Long create(SolicitudAdmisionDTO dto) {
        if (dto.getEstado() == null) {
            dto.setEstado(ESTADO_PENDIENTE);
        }
        SolicitudAdmision entity = mapper.toEntity(dto);
        populateDerived(dto, entity);
        return repository.save(entity).getId();
    }

    public void update(Long id, SolicitudAdmisionDTO dto) {
        SolicitudAdmision entity = repository.findById(id).orElseThrow(NotFoundException::new);
        mapper.updateEntityFromDto(dto, entity);
        populateDerived(dto, entity);
        repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    @Transactional
    public void rechazar(Long id, SolicitudAdmisionRechazoDTO dto, boolean automatico) {
        SolicitudAdmision entity = repository.findById(id).orElseThrow(NotFoundException::new);
        entity.setEstado(ESTADO_RECHAZADA);
        entity.setMotivoRechazo(dto.getMotivo());
        entity.setPropuestaFecha1(null);
        entity.setPropuestaFecha2(null);
        entity.setPropuestaFecha3(null);
        entity.setFechaLimiteRespuesta(null);
        entity.setFechaRespuestaFamilia(null);
        repository.save(entity);

        enviarCorreo(entity, "Estado de tu solicitud",
                "Lamentamos informarte que tu solicitud fue rechazada." +
                        (dto.getMotivo() != null && !dto.getMotivo().isBlank()
                                ? " Motivo: " + dto.getMotivo()
                                : ""));

        log.info("Solicitud {} marcada como rechazada{}", id, automatico ? " (automático)" : "");
    }

    @Transactional
    public void programar(Long id, SolicitudAdmisionProgramarDTO dto) {
        SolicitudAdmision entity = repository.findById(id).orElseThrow(NotFoundException::new);
        mapper.updateEntityFromDto(
                SolicitudAdmisionDTO.builder()
                        .fechasPropuestas(dto.getFechasPropuestas())
                        .documentosRequeridos(dto.getDocumentosRequeridos())
                        .adjuntosInformativos(dto.getAdjuntosInformativos())
                        .cupoDisponible(dto.getCupoDisponible())
                        .disponibilidadCurso(dto.getDisponibilidadCurso())
                        .build(),
                entity);
        entity.setEstado(ESTADO_PROPUESTA);
        entity.setFechaLimiteRespuesta(LocalDate.now().plusDays(15));
        entity.setFechaEntrevista(null);
        entity.setFechaRespuestaFamilia(null);
        repository.save(entity);

        enviarCorreo(entity, "Propuesta de entrevista",
                "Te proponemos las siguientes fechas: " + formatoFechas(entity) +
                        ". Por favor confirmá dentro de los próximos 15 días.");
    }

    @Transactional
    public void confirmarFecha(Long id, SolicitudAdmisionSeleccionDTO dto) {
        SolicitudAdmision entity = repository.findById(id).orElseThrow(NotFoundException::new);
        entity.setFechaEntrevista(dto.getFechaSeleccionada());
        entity.setFechaRespuestaFamilia(LocalDate.now());
        entity.setEstado(ESTADO_PROGRAMADA);
        repository.save(entity);

        enviarCorreo(entity, "Entrevista confirmada",
                "La entrevista fue confirmada para el " +
                        formatDate(dto.getFechaSeleccionada()) + ". ¡Te esperamos!");
    }

    @Transactional
    public void registrarEntrevista(Long id, SolicitudAdmisionEntrevistaDTO dto) {
        SolicitudAdmision entity = repository.findById(id).orElseThrow(NotFoundException::new);
        entity.setEntrevistaRealizada(dto.isRealizada());
        if (dto.isRealizada()) {
            entity.setEstado(ESTADO_ENTREVISTA_REALIZADA);
        } else {
            entity.setEstado(ESTADO_PROPUESTA);
        }
        repository.save(entity);
    }

    @Transactional
    public void decidir(Long id, SolicitudAdmisionDecisionDTO dto) {
        SolicitudAdmision entity = repository.findById(id).orElseThrow(NotFoundException::new);
        if (dto.isAceptar()) {
            entity.setEstado(ESTADO_ACEPTADA);
            enviarCorreo(entity, "Solicitud aceptada",
                    "Felicitaciones, tu solicitud de admisión fue aceptada." +
                            (dto.getMensaje() != null ? " " + dto.getMensaje() : ""));
        } else {
            entity.setEstado(ESTADO_RECHAZADA);
            entity.setMotivoRechazo(dto.getMensaje());
            enviarCorreo(entity, "Solicitud rechazada",
                    "Tu solicitud de admisión fue rechazada." +
                            (dto.getMensaje() != null ? " Motivo: " + dto.getMensaje() : ""));
        }
        repository.save(entity);
    }

    private SolicitudAdmisionDTO toDto(SolicitudAdmision entity) {
        SolicitudAdmisionDTO dto = mapper.toDto(entity);
        populateDerived(dto, entity);
        return dto;
    }

    private void populateDerived(SolicitudAdmisionDTO dto, SolicitudAdmision entity) {
        if (dto == null || entity == null) return;

        if (dto.getDisponibilidadCurso() == null) {
            dto.setDisponibilidadCurso(resolveDisponibilidad(entity));
        }
        if (dto.getCupoDisponible() == null) {
            dto.setCupoDisponible(entity.getCupoDisponible());
        }
        dto.setFechaEntrevistaConfirmada(entity.getFechaEntrevista());
        if (dto.getFechasPropuestas() == null || dto.getFechasPropuestas().isEmpty()) {
            dto.setFechasPropuestas(mapper.toFechaList(entity));
        }
        dto.setAdjuntosInformativos(mapper.splitAdjuntos(entity.getAdjuntosInformativos()));
    }

    private String resolveDisponibilidad(SolicitudAdmision entity) {
        if (entity.getDisponibilidadCurso() != null && !entity.getDisponibilidadCurso().isBlank()) {
            return entity.getDisponibilidadCurso();
        }
        if (entity.getCupoDisponible() == null) {
            return "Pendiente";
        }
        return entity.getCupoDisponible() ? "Disponible" : "Sin cupo";
    }

    private void enviarCorreo(SolicitudAdmision entity, String subject, String body) {
        Aspirante aspirante = entity.getAspirante();
        if (aspirante == null) return;
        Persona persona = aspirante.getPersona();
        String correo = persona != null ? persona.getEmail() : null;
        if (correo == null || correo.isBlank()) {
            log.info("[ADMISION] {} - {}", subject, body);
            return;
        }
        log.info("[ADMISION][EMAIL] to={} subject={} body={} ", correo, subject, body);
    }

    private String formatoFechas(SolicitudAdmision entity) {
        List<String> fechas = mapper.toFechaList(entity).stream()
                .map(this::formatDate)
                .toList();
        return String.join(", ", fechas);
    }

    private String formatDate(LocalDate date) {
        return date != null ? date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "";
    }
}
