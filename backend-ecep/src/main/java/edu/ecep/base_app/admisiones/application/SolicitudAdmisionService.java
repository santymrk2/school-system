package edu.ecep.base_app.admisiones.application;

import edu.ecep.base_app.admisiones.domain.Aspirante;
import edu.ecep.base_app.admisiones.domain.AspiranteFamiliar;
import edu.ecep.base_app.identidad.domain.Familiar;
import edu.ecep.base_app.identidad.domain.Persona;
import edu.ecep.base_app.admisiones.domain.SolicitudAdmision;
import edu.ecep.base_app.admisiones.presentation.dto.SolicitudAdmisionDTO;
import edu.ecep.base_app.admisiones.presentation.dto.SolicitudAdmisionDecisionDTO;
import edu.ecep.base_app.admisiones.presentation.dto.SolicitudAdmisionEntrevistaDTO;
import edu.ecep.base_app.admisiones.presentation.dto.SolicitudAdmisionProgramarDTO;
import edu.ecep.base_app.admisiones.presentation.dto.SolicitudAdmisionRechazoDTO;
import edu.ecep.base_app.admisiones.presentation.dto.SolicitudAdmisionReprogramacionDTO;
import edu.ecep.base_app.admisiones.presentation.dto.SolicitudAdmisionSeleccionDTO;
import edu.ecep.base_app.admisiones.infrastructure.mapper.SolicitudAdmisionMapper;
import edu.ecep.base_app.admisiones.infrastructure.persistence.SolicitudAdmisionRepository;
import edu.ecep.base_app.shared.exception.NotFoundException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
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
        return repository.findAll(Sort.by(Sort.Direction.DESC, "dateCreated"))
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
        entity.setPropuestaHorario1(null);
        entity.setPropuestaHorario2(null);
        entity.setPropuestaHorario3(null);
        entity.setPropuestaNotas(null);
        entity.setFechaLimiteRespuesta(null);
        entity.setFechaRespuestaFamilia(null);
        entity.setPuedeSolicitarReprogramacion(false);
        entity.setReprogramacionSolicitada(false);
        entity.setComentarioReprogramacion(null);
        entity.setCantidadPropuestasEnviadas(0);
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
        List<LocalDate> fechas = dto.getFechasPropuestas() == null
                ? List.of()
                : dto.getFechasPropuestas().stream().filter(Objects::nonNull).toList();
        if (fechas.isEmpty()) {
            throw new IllegalArgumentException("Debe indicar al menos una fecha tentativa.");
        }

        LocalDate hoy = LocalDate.now();
        boolean fechaInvalida = fechas.stream().anyMatch(fecha -> fecha.isBefore(hoy));
        if (fechaInvalida) {
            throw new IllegalArgumentException("Las fechas propuestas deben ser desde hoy en adelante.");
        }

        List<String> horarios = new ArrayList<>();
        if (dto.getRangosHorarios() != null) {
            dto.getRangosHorarios().forEach(horario ->
                    horarios.add(horario == null ? null : horario.trim()));
        }
        if (horarios.size() < fechas.size()) {
            throw new IllegalArgumentException("Completá un rango horario para cada fecha propuesta.");
        }
        boolean horarioVacio = horarios.stream()
                .limit(fechas.size())
                .anyMatch(horario -> horario == null || horario.isBlank());
        if (horarioVacio) {
            throw new IllegalArgumentException("Los rangos horarios no pueden quedar vacíos.");
        }

        mapper.updateEntityFromDto(
                SolicitudAdmisionDTO.builder()
                        .fechasPropuestas(fechas)
                        .rangosHorariosPropuestos(horarios)
                        .aclaracionesPropuesta(dto.getAclaracionesDireccion())
                        .documentosRequeridos(dto.getDocumentosRequeridos())
                        .adjuntosInformativos(dto.getAdjuntosInformativos())
                        .cupoDisponible(dto.getCupoDisponible())
                        .disponibilidadCurso(dto.getDisponibilidadCurso())
                        .build(),
                entity);
        entity.setEstado(ESTADO_PROPUESTA);
        entity.setFechaLimiteRespuesta(hoy.plusDays(15));
        entity.setFechaEntrevista(null);
        entity.setFechaRespuestaFamilia(null);
        entity.setReprogramacionSolicitada(false);
        if (entity.getCantidadPropuestasEnviadas() == null) {
            entity.setCantidadPropuestasEnviadas(0);
        }
        entity.setCantidadPropuestasEnviadas(entity.getCantidadPropuestasEnviadas() + 1);
        entity.setPuedeSolicitarReprogramacion(entity.getCantidadPropuestasEnviadas() <= 1);
        repository.save(entity);

        enviarCorreo(entity, "Propuesta de entrevista",
                construirMensajePropuesta(entity));
    }

    @Transactional
    public void confirmarFecha(Long id, SolicitudAdmisionSeleccionDTO dto) {
        SolicitudAdmision entity = repository.findById(id).orElseThrow(NotFoundException::new);
        entity.setFechaEntrevista(dto.getFechaSeleccionada());
        entity.setFechaRespuestaFamilia(LocalDate.now());
        entity.setEstado(ESTADO_PROGRAMADA);
        entity.setPuedeSolicitarReprogramacion(false);
        entity.setReprogramacionSolicitada(false);
        repository.save(entity);

        enviarCorreo(entity, "Entrevista confirmada",
                "La entrevista fue confirmada para el " +
                        formatDate(dto.getFechaSeleccionada()) + ". ¡Te esperamos!");
    }

    @Transactional
    public void solicitarReprogramacion(Long id, SolicitudAdmisionReprogramacionDTO dto) {
        SolicitudAdmision entity = repository.findById(id).orElseThrow(NotFoundException::new);
        entity.setReprogramacionSolicitada(true);
        entity.setPuedeSolicitarReprogramacion(false);
        entity.setComentarioReprogramacion(dto.getComentario());
        entity.setEstado(ESTADO_PROPUESTA);
        repository.save(entity);
        log.info("Solicitud {} pidió nuevas fechas", id);
    }

    @Transactional
    public void registrarEntrevista(Long id, SolicitudAdmisionEntrevistaDTO dto) {
        SolicitudAdmision entity = repository.findById(id).orElseThrow(NotFoundException::new);
        if (dto.getComentarios() != null) {
            entity.setComentariosEntrevista(dto.getComentarios());
        }
        if (dto.getRealizada() != null) {
            entity.setEntrevistaRealizada(dto.getRealizada());
            if (Boolean.TRUE.equals(dto.getRealizada())) {
                entity.setEstado(ESTADO_ENTREVISTA_REALIZADA);
            } else {
                entity.setEstado(ESTADO_PROPUESTA);
                entity.setPuedeSolicitarReprogramacion(true);
                entity.setReprogramacionSolicitada(false);
                entity.setFechaEntrevista(null);
            }
        }
        repository.save(entity);
    }

    @Transactional
    public void decidir(Long id, SolicitudAdmisionDecisionDTO dto) {
        SolicitudAdmision entity = repository.findById(id).orElseThrow(NotFoundException::new);
        if (dto.isAceptar()) {
            entity.setEstado(ESTADO_ACEPTADA);
            entity.setMotivoRechazo(null);
            if (dto.getMensaje() != null && !dto.getMensaje().isBlank()) {
                entity.setNotasDireccion(dto.getMensaje());
            }
            log.info("Solicitud {} marcada como aceptada", id);
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
        if (dto.getRangosHorariosPropuestos() == null || dto.getRangosHorariosPropuestos().isEmpty()) {
            dto.setRangosHorariosPropuestos(mapper.toHorarioList(entity));
        }
        if (dto.getAclaracionesPropuesta() == null) {
            dto.setAclaracionesPropuesta(entity.getPropuestaNotas());
        }
        dto.setAdjuntosInformativos(mapper.splitAdjuntos(entity.getAdjuntosInformativos()));
        if (dto.getComentariosEntrevista() == null) {
            dto.setComentariosEntrevista(entity.getComentariosEntrevista());
        }
        if (dto.getPuedeSolicitarReprogramacion() == null) {
            dto.setPuedeSolicitarReprogramacion(entity.getPuedeSolicitarReprogramacion());
        }
        if (dto.getReprogramacionSolicitada() == null) {
            dto.setReprogramacionSolicitada(entity.getReprogramacionSolicitada());
        }
        if (dto.getComentarioReprogramacion() == null) {
            dto.setComentarioReprogramacion(entity.getComentarioReprogramacion());
        }
        if (dto.getCantidadPropuestasEnviadas() == null) {
            dto.setCantidadPropuestasEnviadas(entity.getCantidadPropuestasEnviadas() == null
                    ? 0
                    : entity.getCantidadPropuestasEnviadas());
        }
        if (dto.getFechaSolicitud() == null) {
            dto.setFechaSolicitud(entity.getDateCreated());
        }
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
        Optional<String> correo = obtenerCorreoContacto(entity);
        if (correo.isEmpty()) {
            log.info("[ADMISION][EMAIL-MISSING] subject={} body={} ", subject, body);
            return;
        }
        log.info("[ADMISION][EMAIL] to={} subject={} body={} ", correo.get(), subject, body);
    }

    private Optional<String> obtenerCorreoContacto(SolicitudAdmision entity) {
        if (entity == null) {
            return Optional.empty();
        }
        Aspirante aspirante = entity.getAspirante();
        if (aspirante == null) {
            return Optional.empty();
        }

        Optional<String> correoFamiliar = aspirante.getFamiliares().stream()
                .filter(Objects::nonNull)
                .filter(AspiranteFamiliar::isActivo)
                .sorted(Comparator.comparing(AspiranteFamiliar::getDateCreated,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .map(AspiranteFamiliar::getFamiliar)
                .filter(Objects::nonNull)
                .map(Familiar::getPersona)
                .map(this::correoPrincipal)
                .filter(correo -> correo != null && !correo.isBlank())
                .findFirst();

        if (correoFamiliar.isPresent()) {
            return correoFamiliar;
        }

        return Optional.ofNullable(correoPrincipal(aspirante.getPersona()));
    }

    private String correoPrincipal(Persona persona) {
        if (persona == null) {
            return null;
        }
        if (persona.getEmailContacto() != null && !persona.getEmailContacto().isBlank()) {
            return persona.getEmailContacto();
        }
        if (persona.getEmail() != null && !persona.getEmail().isBlank()) {
            return persona.getEmail();
        }
        return null;
    }

    private String construirMensajePropuesta(SolicitudAdmision entity) {
        StringBuilder sb = new StringBuilder();
        sb.append("Hola, te proponemos las siguientes opciones de entrevista:\n");
        List<String> opciones = formatoOpcionesEntrevista(entity);
        for (int i = 0; i < opciones.size(); i++) {
            sb.append(" - Opción ").append(i + 1).append(": ").append(opciones.get(i)).append("\n");
        }
        if (Boolean.TRUE.equals(entity.getPuedeSolicitarReprogramacion())) {
            sb.append("Si ninguna fecha se ajusta podés elegir 'Pedir otras fechas' y dejarnos un comentario.\n");
        }
        if (entity.getDocumentosRequeridos() != null && !entity.getDocumentosRequeridos().isBlank()) {
            sb.append("Documentación para revisar: ").append(entity.getDocumentosRequeridos()).append("\n");
        }
        List<String> adjuntos = mapper.splitAdjuntos(entity.getAdjuntosInformativos());
        if (!adjuntos.isEmpty()) {
            sb.append("Material adicional:\n");
            adjuntos.forEach(link -> sb.append("   • ").append(link).append("\n"));
        }
        if (entity.getPropuestaNotas() != null && !entity.getPropuestaNotas().isBlank()) {
            sb.append("Notas de la dirección: ").append(entity.getPropuestaNotas()).append("\n");
        }
        if (entity.getFechaLimiteRespuesta() != null) {
            sb.append("Respondé antes del ")
                    .append(formatDate(entity.getFechaLimiteRespuesta()))
                    .append(".\n");
        }
        sb.append("Podés confirmar la opción elegida desde los botones del correo.");
        return sb.toString();
    }

    private List<String> formatoOpcionesEntrevista(SolicitudAdmision entity) {
        List<LocalDate> fechas = mapper.toFechaList(entity);
        List<String> horarios = mapper.toHorarioList(entity);
        List<String> opciones = new ArrayList<>();
        for (int i = 0; i < fechas.size(); i++) {
            LocalDate fecha = fechas.get(i);
            String base = formatDate(fecha);
            String horario = i < horarios.size() ? horarios.get(i) : null;
            if (horario != null && !horario.isBlank()) {
                opciones.add(base + " (" + horario + ")");
            } else {
                opciones.add(base);
            }
        }
        return opciones;
    }

    private String formatDate(LocalDate date) {
        return date != null ? date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "";
    }
}
