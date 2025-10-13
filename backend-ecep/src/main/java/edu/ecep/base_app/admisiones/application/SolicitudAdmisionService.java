package edu.ecep.base_app.admisiones.application;

import edu.ecep.base_app.admisiones.domain.Aspirante;
import edu.ecep.base_app.admisiones.domain.AspiranteFamiliar;
import edu.ecep.base_app.admisiones.domain.SolicitudAdmision;
import edu.ecep.base_app.admisiones.presentation.dto.SolicitudAdmisionAltaDTO;
import edu.ecep.base_app.admisiones.presentation.dto.SolicitudAdmisionAltaResultDTO;
import edu.ecep.base_app.admisiones.presentation.dto.SolicitudAdmisionDTO;
import edu.ecep.base_app.admisiones.presentation.dto.SolicitudAdmisionDecisionDTO;
import edu.ecep.base_app.admisiones.presentation.dto.SolicitudAdmisionEntrevistaDTO;
import edu.ecep.base_app.admisiones.presentation.dto.SolicitudAdmisionPortalDTO;
import edu.ecep.base_app.admisiones.presentation.dto.SolicitudAdmisionPortalOpcionDTO;
import edu.ecep.base_app.admisiones.presentation.dto.SolicitudAdmisionPortalSeleccionDTO;
import edu.ecep.base_app.admisiones.presentation.dto.SolicitudAdmisionProgramarDTO;
import edu.ecep.base_app.admisiones.presentation.dto.SolicitudAdmisionRechazoDTO;
import edu.ecep.base_app.admisiones.presentation.dto.SolicitudAdmisionReprogramacionDTO;
import edu.ecep.base_app.admisiones.presentation.dto.SolicitudAdmisionSeleccionDTO;
import edu.ecep.base_app.admisiones.infrastructure.mapper.SolicitudAdmisionMapper;
import edu.ecep.base_app.admisiones.infrastructure.persistence.SolicitudAdmisionRepository;
import edu.ecep.base_app.admisiones.infrastructure.persistence.AspiranteRepository;
import edu.ecep.base_app.calendario.infrastructure.persistence.PeriodoEscolarRepository;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.SeccionRepository;
import edu.ecep.base_app.identidad.application.AlumnoService;
import edu.ecep.base_app.identidad.domain.Alumno;
import edu.ecep.base_app.identidad.domain.AlumnoFamiliar;
import edu.ecep.base_app.identidad.domain.Empleado;
import edu.ecep.base_app.identidad.domain.Familiar;
import edu.ecep.base_app.identidad.domain.Persona;
import edu.ecep.base_app.identidad.domain.enums.RolEmpleado;
import edu.ecep.base_app.identidad.infrastructure.persistence.AlumnoRepository;
import edu.ecep.base_app.identidad.infrastructure.persistence.AlumnoFamiliarRepository;
import edu.ecep.base_app.identidad.infrastructure.persistence.EmpleadoRepository;
import edu.ecep.base_app.identidad.presentation.dto.AlumnoDTO;
import edu.ecep.base_app.shared.exception.NotFoundException;
import edu.ecep.base_app.shared.notification.EmailService;
import edu.ecep.base_app.vidaescolar.application.MatriculaSeccionHistorialService;
import edu.ecep.base_app.vidaescolar.application.MatriculaService;
import edu.ecep.base_app.vidaescolar.domain.Matricula;
import edu.ecep.base_app.vidaescolar.infrastructure.persistence.MatriculaRepository;
import edu.ecep.base_app.vidaescolar.presentation.dto.MatriculaCreateDTO;
import edu.ecep.base_app.vidaescolar.presentation.dto.MatriculaSeccionHistorialCreateDTO;
import jakarta.mail.MessagingException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;


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
    private final AspiranteRepository aspiranteRepository;
    private final AlumnoRepository alumnoRepository;
    private final AlumnoFamiliarRepository alumnoFamiliarRepository;
    private final AlumnoService alumnoService;
    private final MatriculaRepository matriculaRepository;
    private final MatriculaService matriculaService;
    private final MatriculaSeccionHistorialService matriculaSeccionHistorialService;
    private final PeriodoEscolarRepository periodoEscolarRepository;
    private final SeccionRepository seccionRepository;
    private final EmpleadoRepository empleadoRepository;
    private final EmailService emailService;

    @Value("${app.portal.admissions-base-url:http://localhost:3000/entrevista}")
    private String portalBaseUrl;

    public List<SolicitudAdmisionDTO> findAll() {
        return findAll(null);
    }

    public List<SolicitudAdmisionDTO> findAll(Long aspiranteId) {
        List<SolicitudAdmision> solicitudes =
                aspiranteId == null
                        ? repository.findAll(SolicitudAdmisionRepository.DEFAULT_SORT)
                        : repository.findAllByAspiranteId(aspiranteId, SolicitudAdmisionRepository.DEFAULT_SORT);

        return solicitudes.stream().map(this::toDto).toList();
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
        entity.setHorarioEntrevistaConfirmado(null);
        entity.setOpcionEntrevistaSeleccionada(null);
        entity.setPortalTokenSeleccion(null);
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
        entity.setComentarioReprogramacion(null);
        entity.setHorarioEntrevistaConfirmado(null);
        entity.setOpcionEntrevistaSeleccionada(null);
        if (entity.getCantidadPropuestasEnviadas() == null) {
            entity.setCantidadPropuestasEnviadas(0);
        }
        entity.setCantidadPropuestasEnviadas(entity.getCantidadPropuestasEnviadas() + 1);
        entity.setPuedeSolicitarReprogramacion(entity.getCantidadPropuestasEnviadas() <= 1);
        entity.setPortalTokenSeleccion(generarTokenSeleccion(entity));
        repository.save(entity);

        enviarCorreoPropuesta(entity);
    }

    private void enviarCorreoPropuesta(SolicitudAdmision entity) {
        String enlacePortal = construirEnlacePortal(entity);
        String body = construirMensajePropuestaHtml(entity, enlacePortal);
        enviarCorreo(entity, "Propuesta de entrevista", body, true);
    }

    private String construirEnlacePortal(SolicitudAdmision entity) {
        if (entity == null) {
            return null;
        }
        String token = entity.getPortalTokenSeleccion();
        if (token == null || token.isBlank()) {
            return null;
        }

        String base = portalBaseUrl;
        if (base == null || base.isBlank()) {
            base = "http://localhost:3000/entrevista";
        }

        StringBuilder enlace = new StringBuilder(base);
        if (base.contains("?")) {
            if (!base.endsWith("?") && !base.endsWith("&")) {
                enlace.append("&");
            }
        } else {
            enlace.append("?");
        }
        enlace.append("token=").append(token);
        obtenerCorreoContacto(entity)
                .filter(correo -> correo != null && !correo.isBlank())
                .ifPresent(correo -> enlace.append("&email=")
                        .append(URLEncoder.encode(correo, StandardCharsets.UTF_8)));
        return enlace.toString();
    }

    private String generarTokenSeleccion(SolicitudAdmision entity) {
        String token;
        do {
            token = UUID.randomUUID().toString();
        } while (repository.findByPortalTokenSeleccion(token)
                .filter(existing -> entity.getId() == null || !existing.getId().equals(entity.getId()))
                .isPresent());
        return token;
    }

    @Transactional
    public void confirmarFecha(Long id, SolicitudAdmisionSeleccionDTO dto) {
        SolicitudAdmision entity = repository.findById(id).orElseThrow(NotFoundException::new);
        Integer opcionSeleccionada = dto.getOpcionSeleccionada();
        if (opcionSeleccionada == null && dto.getFechaSeleccionada() != null) {
            opcionSeleccionada = resolverIndicePorFecha(entity, dto.getFechaSeleccionada());
        }
        String horarioSeleccionado = dto.getHorarioSeleccionado();
        if (horarioSeleccionado == null && opcionSeleccionada != null) {
            horarioSeleccionado = obtenerHorarioPorIndice(entity, opcionSeleccionada);
        }

        registrarConfirmacion(entity, dto.getFechaSeleccionada(), opcionSeleccionada, horarioSeleccionado);

        enviarCorreo(entity, "Entrevista confirmada",
                construirMensajeConfirmacion(dto.getFechaSeleccionada(), horarioSeleccionado));
    }

    public SolicitudAdmisionPortalDTO obtenerDetallePortal(String token, String email) {
        SolicitudAdmision entity = repository.findByPortalTokenSeleccion(token)
                .orElseThrow(NotFoundException::new);
        validarAccesoPortal(entity, email);
        return construirPortalDTO(entity);
    }

    @Transactional
    public SolicitudAdmisionPortalDTO responderDesdePortal(
            String token, SolicitudAdmisionPortalSeleccionDTO dto, String email) {
        if (dto == null || dto.getOpcion() == null) {
            throw new IllegalArgumentException("Debe seleccionar una opción válida");
        }
        SolicitudAdmision entity = repository.findByPortalTokenSeleccion(token)
                .orElseThrow(NotFoundException::new);
        validarAccesoPortal(entity, email);

        boolean yaRespondida = entity.getFechaEntrevista() != null
                || Boolean.TRUE.equals(entity.getReprogramacionSolicitada());
        if (yaRespondida) {
            log.info("Solicitud {} ya registra una respuesta previa desde el portal", entity.getId());
            return construirPortalDTO(entity);
        }

        SolicitudAdmisionPortalSeleccionDTO.Respuesta opcion = dto.getOpcion();
        if (opcion == SolicitudAdmisionPortalSeleccionDTO.Respuesta.NO_DISPONIBLE) {
            if (!Boolean.TRUE.equals(entity.getPuedeSolicitarReprogramacion())) {
                throw new IllegalStateException("Ya no es posible solicitar nuevas fechas para esta entrevista");
            }
            String comentario = dto.getComentario();
            if (comentario == null || comentario.isBlank()) {
                comentario = "La familia indicó desde el portal que no está disponible en las fechas propuestas.";
            }
            registrarReprogramacion(entity, comentario);
            log.info("Solicitud {} solicitó nuevas fechas desde el portal", entity.getId());
        } else {
            int indice = switch (opcion) {
                case OPCION_1 -> 1;
                case OPCION_2 -> 2;
                case OPCION_3 -> 3;
                default -> throw new IllegalArgumentException("Opción inválida");
            };
            LocalDate fecha = obtenerFechaPorIndice(entity, indice);
            if (fecha == null) {
                throw new IllegalStateException("La opción seleccionada ya no está disponible");
            }
            String horario = obtenerHorarioPorIndice(entity, indice);
            registrarConfirmacion(entity, fecha, indice, horario);
            enviarCorreo(entity, "Entrevista confirmada",
                    construirMensajeConfirmacion(fecha, horario));
            log.info("Solicitud {} confirmó la opción {} desde el portal", entity.getId(), indice);
        }

        return construirPortalDTO(entity);
    }

    @Transactional
    public void solicitarReprogramacion(Long id, SolicitudAdmisionReprogramacionDTO dto) {
        SolicitudAdmision entity = repository.findById(id).orElseThrow(NotFoundException::new);
        registrarReprogramacion(entity, dto.getComentario());
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

    @Transactional
    public SolicitudAdmisionAltaResultDTO darDeAlta(Long id, SolicitudAdmisionAltaDTO dto) {
        SolicitudAdmision solicitud = repository.findById(id).orElseThrow(NotFoundException::new);

        if (Boolean.TRUE.equals(dto.getAutoAsignarSiguientePeriodo())) {
            throw new IllegalArgumentException(
                    "La autoasignación del próximo período lectivo todavía no está disponible.");
        }

        if (!ESTADO_ENTREVISTA_REALIZADA.equalsIgnoreCase(solicitud.getEstado())
                && !ESTADO_ACEPTADA.equalsIgnoreCase(solicitud.getEstado())) {
            throw new IllegalStateException("La solicitud debe tener la entrevista realizada para dar el alta");
        }

        Aspirante aspirante = solicitud.getAspirante();
        if (aspirante == null || aspirante.getPersona() == null) {
            throw new IllegalStateException("La solicitud no tiene un aspirante válido");
        }

        if (dto.getTurno() != null) {
            aspirante.setTurnoPreferido(dto.getTurno());
            aspiranteRepository.save(aspirante);
        }

        Long personaId = aspirante.getPersona().getId();
        if (personaId == null) {
            throw new IllegalStateException("El aspirante no tiene persona asociada");
        }

        Alumno alumno = alumnoRepository.findByPersonaId(personaId).orElse(null);
        Long alumnoId;
        if (alumno == null) {
            AlumnoDTO alumnoDTO = new AlumnoDTO();
            alumnoDTO.setPersonaId(personaId);
            alumnoDTO.setFechaInscripcion(LocalDate.now());
            alumnoId = alumnoService.create(alumnoDTO);
            alumno = alumnoRepository.findById(alumnoId)
                    .orElseThrow(() -> new NotFoundException("Alumno no creado"));
        } else {
            alumnoId = alumno.getId();
        }

        migrarFamiliaresAspirante(aspirante, alumno);

        var periodoDestino = Optional.ofNullable(dto.getPeriodoEscolarId())
                .map(periodoId -> periodoEscolarRepository.findById(periodoId)
                        .orElseThrow(() -> new NotFoundException("Período escolar no encontrado")))
                .orElseGet(() -> periodoEscolarRepository.findByActivoTrue().stream()
                        .findFirst()
                        .orElseThrow(() -> new IllegalStateException("No hay un período escolar activo")));

        if (!periodoDestino.isActivo()) {
            throw new IllegalArgumentException("El período lectivo seleccionado no se encuentra activo");
        }

        boolean matriculaExistente = matriculaRepository
                .existsByAlumnoIdAndPeriodoEscolarId(alumnoId, periodoDestino.getId());
        if (matriculaExistente) {
            throw new IllegalStateException(
                    "La persona ya cuenta con una matrícula activa en el período lectivo seleccionado");
        }

        Long matriculaId = matriculaService.create(new MatriculaCreateDTO(alumnoId, periodoDestino.getId()));

        Long seccionId = null;
        if (dto.getSeccionId() != null) {
            var seccion = seccionRepository.findById(dto.getSeccionId())
                    .orElseThrow(() -> new NotFoundException("Sección no encontrada"));
            if (!seccion.isActivo()) {
                throw new IllegalArgumentException("La sección seleccionada no se encuentra activa");
            }
            var periodoSeccion = seccion.getPeriodoEscolar();
            if (periodoSeccion != null && !Objects.equals(periodoSeccion.getId(), periodoDestino.getId())) {
                throw new IllegalArgumentException(
                        "La sección seleccionada pertenece a otro período lectivo");
            }
            seccionId = seccion.getId();
            matriculaSeccionHistorialService.asignar(new MatriculaSeccionHistorialCreateDTO(
                    matriculaId,
                    seccionId,
                    LocalDate.now(),
                    null));
        }

        solicitud.setEstado(ESTADO_ACEPTADA);
        repository.save(solicitud);

        return new SolicitudAdmisionAltaResultDTO(alumnoId, matriculaId, seccionId);
    }

    private void migrarFamiliaresAspirante(Aspirante aspirante, Alumno alumno) {
        if (aspirante == null || alumno == null) {
            return;
        }
        Set<AspiranteFamiliar> familiares = aspirante.getFamiliares();
        if (familiares == null || familiares.isEmpty()) {
            return;
        }

        for (AspiranteFamiliar aspiranteFamiliar : familiares) {
            if (aspiranteFamiliar == null || !aspiranteFamiliar.isActivo()) {
                continue;
            }
            Familiar familiar = aspiranteFamiliar.getFamiliar();
            if (familiar == null || familiar.getId() == null) {
                continue;
            }

            AlumnoFamiliar existente = alumno.getFamiliares().stream()
                    .filter(af -> af.getFamiliar() != null && familiar.getId().equals(af.getFamiliar().getId()))
                    .findFirst()
                    .orElse(null);

            if (existente == null) {
                AlumnoFamiliar nuevo = new AlumnoFamiliar();
                nuevo.setAlumno(alumno);
                nuevo.setFamiliar(familiar);
                nuevo.setRolVinculo(aspiranteFamiliar.getRolVinculo());
                nuevo.setConvive(Boolean.TRUE.equals(aspiranteFamiliar.getConvive()));
                alumnoFamiliarRepository.save(nuevo);
                alumno.getFamiliares().add(nuevo);
            } else {
                existente.setRolVinculo(aspiranteFamiliar.getRolVinculo());
                existente.setConvive(Boolean.TRUE.equals(aspiranteFamiliar.getConvive()));
                alumnoFamiliarRepository.save(existente);
            }
        }
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
        dto.setHorarioEntrevistaConfirmado(entity.getHorarioEntrevistaConfirmado());
        dto.setOpcionEntrevistaSeleccionada(entity.getOpcionEntrevistaSeleccionada());
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

        Long alumnoId = dto.getAlumnoId();
        if (alumnoId == null || dto.getMatriculaId() == null || dto.getAltaGenerada() == null) {
            Aspirante aspirante = entity.getAspirante();
            Persona persona = aspirante != null ? aspirante.getPersona() : null;
            Long personaId = persona != null ? persona.getId() : null;
            if (personaId != null) {
                Optional<Alumno> alumnoOpt = alumnoRepository.findByPersonaId(personaId);
                if (alumnoOpt.isPresent()) {
                    Alumno alumno = alumnoOpt.get();
                    if (alumnoId == null) {
                        alumnoId = alumno.getId();
                        dto.setAlumnoId(alumnoId);
                    }
                }
            }
        }

        if (alumnoId != null && dto.getMatriculaId() == null) {
            List<Matricula> matriculas = matriculaRepository.findByAlumnoId(alumnoId);
            matriculas.stream()
                    .filter(Objects::nonNull)
                    .filter(Matricula::isActivo)
                    .findFirst()
                    .ifPresent(m -> dto.setMatriculaId(m.getId()));
        }

        if (dto.getAltaGenerada() == null) {
            dto.setAltaGenerada(dto.getAlumnoId() != null && dto.getMatriculaId() != null);
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
        enviarCorreo(entity, subject, body, false);
    }

    private void enviarCorreo(SolicitudAdmision entity, String subject, String body, boolean html) {
        Optional<String> correo = obtenerCorreoContacto(entity);
        if (correo.isEmpty()) {
            Long solicitudId = entity != null ? entity.getId() : null;
            log.info(
                    "[ADMISION][EMAIL-MISSING] solicitud={} subject={} body={} ",
                    solicitudId,
                    sanitizeForLog(subject),
                    sanitizeForLog(body));
            return;
        }
        String destinatario = correo.get();
        boolean notificationsEnabled = emailService.isNotificationsEnabled();
        if (!notificationsEnabled) {
            Long solicitudId = entity != null ? entity.getId() : null;
            log.info(
                    "[ADMISION][EMAIL-DISABLED] Simulando envío de correo solicitud={} to={} subject={} formato={} body={}",
                    solicitudId,
                    destinatario,
                    sanitizeForLog(subject),
                    html ? "HTML" : "PLAIN",
                    sanitizeForLog(body));
            return;
        }
        try {
            if (html) {
                emailService.sendHtml(destinatario, subject, body);
            } else {
                emailService.sendPlainText(destinatario, subject, body);
            }
            if (!Boolean.TRUE.equals(entity.getEmailConfirmacionEnviado())) {
                entity.setEmailConfirmacionEnviado(true);
                repository.save(entity);
            }
        } catch (MessagingException | MailException ex) {
            Long solicitudId = entity != null ? entity.getId() : null;
            log.error(
                    "[ADMISION][EMAIL-ERROR] solicitud={} to={} subject={} body={} error={}",
                    solicitudId,
                    destinatario,
                    sanitizeForLog(subject),
                    sanitizeForLog(body),
                    ex.getMessage(),
                    ex);
        }
    }

    private String sanitizeForLog(String text) {
        if (text == null) {
            return "";
        }
        String collapsedWhitespace = text.replaceAll("[\\r\\n]+", " ");
        return collapsedWhitespace.replaceAll("\\s{2,}", " ").trim();
    }

    private void validarAccesoPortal(SolicitudAdmision entity, String email) {
        if (entity == null) {
            throw new NotFoundException();
        }
        Optional<String> correo = obtenerCorreoContacto(entity);
        if (correo.isEmpty()) {
            return;
        }
        if (!StringUtils.hasText(email)) {
            log.warn("[ADMISION][PORTAL-ACCESS] acceso rechazado por falta de email para la solicitud {}", entity.getId());
            throw new NotFoundException();
        }
        String correoNormalizado = correo.get().trim();
        String emailNormalizado = email.trim();
        if (!correoNormalizado.equalsIgnoreCase(emailNormalizado)) {
            log.warn("[ADMISION][PORTAL-ACCESS] email {} no coincide con el contacto registrado para la solicitud {}", emailNormalizado, entity.getId());
            throw new NotFoundException();
        }
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

    private String construirMensajePropuestaHtml(SolicitudAdmision entity, String enlacePortal) {
        StringBuilder sb = new StringBuilder();
        sb.append("<p>Hola, te proponemos las siguientes opciones de entrevista:</p>");
        List<String> opciones = formatoOpcionesEntrevista(entity);
        if (!opciones.isEmpty()) {
            sb.append("<ol>");
            for (int i = 0; i < opciones.size(); i++) {
                sb.append("<li><strong>Opción ")
                        .append(i + 1)
                        .append("</strong>: ")
                        .append(opciones.get(i))
                        .append("</li>");
            }
            sb.append("</ol>");
        }

        if (Boolean.TRUE.equals(entity.getPuedeSolicitarReprogramacion())) {
            sb.append("<p>Si ninguna fecha se ajusta podés elegir <em>No estoy disponible</em> para que la dirección proponga nuevos horarios.</p>");
        }

        if (entity.getDocumentosRequeridos() != null && !entity.getDocumentosRequeridos().isBlank()) {
            sb.append("<p><strong>Documentación para revisar:</strong> ")
                    .append(entity.getDocumentosRequeridos())
                    .append("</p>");
        }

        List<String> adjuntos = mapper.splitAdjuntos(entity.getAdjuntosInformativos());
        if (!adjuntos.isEmpty()) {
            sb.append("<p><strong>Material adicional:</strong></p><ul>");
            adjuntos.forEach(link -> sb.append("<li><a href=\"")
                    .append(link)
                    .append("\">")
                    .append(link)
                    .append("</a></li>"));
            sb.append("</ul>");
        }

        if (entity.getPropuestaNotas() != null && !entity.getPropuestaNotas().isBlank()) {
            sb.append("<p><strong>Notas de la dirección:</strong> ")
                    .append(entity.getPropuestaNotas())
                    .append("</p>");
        }

        if (entity.getFechaLimiteRespuesta() != null) {
            sb.append("<p>Respondé antes del ")
                    .append(formatDate(entity.getFechaLimiteRespuesta()))
                    .append(".</p>");
        }

        if (enlacePortal != null && !enlacePortal.isBlank()) {
            sb.append("<p style=\"margin:24px 0;\"><a href=\"")
                    .append(enlacePortal)
                    .append("\" style=\"background-color:#1d4ed8;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block;\">Elegir fecha de entrevista</a></p>");
            sb.append("<p>Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br/><a href=\"")
                    .append(enlacePortal)
                    .append("\">")
                    .append(enlacePortal)
                    .append("</a></p>");
        }

        sb.append("<p>¡Gracias por tu interés en la escuela!</p>");
        return sb.toString();
    }

    private SolicitudAdmisionPortalDTO construirPortalDTO(SolicitudAdmision entity) {
        String aspiranteNombre = Optional.ofNullable(entity.getAspirante())
                .map(Aspirante::getPersona)
                .map(this::nombreCompleto)
                .orElse("Aspirante");
        Optional<String> correo = obtenerCorreoContacto(entity);
        List<SolicitudAdmisionPortalOpcionDTO> opciones = new ArrayList<>();
        List<String> etiquetas = formatoOpcionesEntrevista(entity);
        for (int i = 0; i < etiquetas.size(); i++) {
            int indice = i + 1;
            opciones.add(SolicitudAdmisionPortalOpcionDTO.builder()
                    .indice(indice)
                    .fecha(obtenerFechaPorIndice(entity, indice))
                    .horario(obtenerHorarioPorIndice(entity, indice))
                    .etiqueta(etiquetas.get(i))
                    .build());
        }

        boolean reprogramacionSolicitada = Boolean.TRUE.equals(entity.getReprogramacionSolicitada());
        boolean respuestaRegistrada = entity.getFechaEntrevista() != null || reprogramacionSolicitada;

        return SolicitudAdmisionPortalDTO.builder()
                .solicitudId(entity.getId())
                .aspirante(aspiranteNombre)
                .correoReferencia(correo.orElse(null))
                .disponibilidadCurso(entity.getDisponibilidadCurso())
                .cupoDisponible(entity.getCupoDisponible())
                .opciones(opciones)
                .permiteSolicitarReprogramacion(Boolean.TRUE.equals(entity.getPuedeSolicitarReprogramacion()))
                .reprogramacionSolicitada(reprogramacionSolicitada)
                .respuestaRegistrada(respuestaRegistrada)
                .fechaSeleccionada(entity.getFechaEntrevista())
                .horarioSeleccionado(entity.getHorarioEntrevistaConfirmado())
                .opcionSeleccionada(entity.getOpcionEntrevistaSeleccionada())
                .aclaracionesDireccion(entity.getPropuestaNotas())
                .documentosRequeridos(entity.getDocumentosRequeridos())
                .adjuntosInformativos(mapper.splitAdjuntos(entity.getAdjuntosInformativos()))
                .fechaLimiteRespuesta(entity.getFechaLimiteRespuesta())
                .notasDireccion(entity.getNotasDireccion())
                .build();
    }

    private String nombreCompleto(Persona persona) {
        if (persona == null) {
            return "";
        }
        String nombre = persona.getNombre() == null ? "" : persona.getNombre().trim();
        String apellido = persona.getApellido() == null ? "" : persona.getApellido().trim();
        return (nombre + " " + apellido).trim();
    }

    private void registrarConfirmacion(
            SolicitudAdmision entity,
            LocalDate fechaSeleccionada,
            Integer opcionSeleccionada,
            String horarioSeleccionado) {
        entity.setFechaEntrevista(fechaSeleccionada);
        entity.setHorarioEntrevistaConfirmado(horarioSeleccionado);
        entity.setOpcionEntrevistaSeleccionada(opcionSeleccionada);
        entity.setFechaRespuestaFamilia(LocalDate.now());
        entity.setEstado(ESTADO_PROGRAMADA);
        entity.setPuedeSolicitarReprogramacion(false);
        entity.setReprogramacionSolicitada(false);
        entity.setComentarioReprogramacion(null);
        repository.save(entity);
        notificarDireccionConfirmacion(entity);
    }

    private void notificarDireccionConfirmacion(SolicitudAdmision entity) {
        if (entity == null) {
            return;
        }
        if (entity.getFechaEntrevista() == null) {
            return;
        }

        List<Empleado> responsables = empleadoRepository.findByRolEmpleado(RolEmpleado.DIRECCION);
        if (responsables == null || responsables.isEmpty()) {
            log.info("[ADMISION][NOTIFY] No hay destinatarios configurados para notificar la solicitud {}", entity.getId());
            return;
        }

        Set<String> destinatarios = new LinkedHashSet<>();
        for (Empleado empleado : responsables) {
            if (empleado == null) {
                continue;
            }
            Persona persona = empleado.getPersona();
            String correo = correoPrincipal(persona);
            if (correo != null && !correo.isBlank()) {
                destinatarios.add(correo);
            }
        }

        if (destinatarios.isEmpty()) {
            log.info("[ADMISION][NOTIFY] No se encontraron correos válidos para notificar la solicitud {}", entity.getId());
            return;
        }

        String aspirante = nombreCompleto(entity.getAspirante() != null ? entity.getAspirante().getPersona() : null);
        String fecha = formatDate(entity.getFechaEntrevista());
        String horario = entity.getHorarioEntrevistaConfirmado();
        String subject = "Entrevista confirmada" +
                (StringUtils.hasText(aspirante) ? " - " + aspirante : "");

        StringBuilder body = new StringBuilder("La familia confirmó la entrevista");
        if (StringUtils.hasText(aspirante)) {
            body.append(" de ").append(aspirante);
        }
        if (StringUtils.hasText(fecha)) {
            body.append(" para el ").append(fecha);
        }
        if (StringUtils.hasText(horario)) {
            body.append(" (").append(horario).append(")");
        }
        body.append(".\n\n");
        body.append("Solicitud #").append(entity.getId()).append(".");
        body.append("\nPodés registrar el resultado desde el panel de solicitudes de admisión.");

        for (String destinatario : destinatarios) {
            try {
                emailService.sendPlainText(destinatario, subject, body.toString());
            } catch (MessagingException | MailException ex) {
                log.error("[ADMISION][EMAIL-ERROR] No se pudo notificar a {} sobre la solicitud {}: {}",
                        destinatario, entity.getId(), ex.getMessage(), ex);
            }
        }
    }

    private void registrarReprogramacion(SolicitudAdmision entity, String comentario) {
        entity.setReprogramacionSolicitada(true);
        entity.setPuedeSolicitarReprogramacion(false);
        entity.setComentarioReprogramacion(comentario);
        entity.setEstado(ESTADO_PROPUESTA);
        entity.setFechaEntrevista(null);
        entity.setHorarioEntrevistaConfirmado(null);
        entity.setOpcionEntrevistaSeleccionada(null);
        entity.setFechaRespuestaFamilia(LocalDate.now());
        repository.save(entity);
    }

    private Integer resolverIndicePorFecha(SolicitudAdmision entity, LocalDate fecha) {
        if (entity == null || fecha == null) {
            return null;
        }
        if (fecha.equals(entity.getPropuestaFecha1())) {
            return 1;
        }
        if (fecha.equals(entity.getPropuestaFecha2())) {
            return 2;
        }
        if (fecha.equals(entity.getPropuestaFecha3())) {
            return 3;
        }
        return null;
    }

    private LocalDate obtenerFechaPorIndice(SolicitudAdmision entity, int indice) {
        return switch (indice) {
            case 1 -> entity.getPropuestaFecha1();
            case 2 -> entity.getPropuestaFecha2();
            case 3 -> entity.getPropuestaFecha3();
            default -> null;
        };
    }

    private String obtenerHorarioPorIndice(SolicitudAdmision entity, Integer indice) {
        if (entity == null || indice == null) {
            return null;
        }
        return switch (indice) {
            case 1 -> entity.getPropuestaHorario1();
            case 2 -> entity.getPropuestaHorario2();
            case 3 -> entity.getPropuestaHorario3();
            default -> null;
        };
    }

    private String construirMensajeConfirmacion(LocalDate fecha, String horario) {
        if (fecha == null) {
            return "La entrevista fue confirmada. ¡Te esperamos!";
        }
        StringBuilder sb = new StringBuilder("La entrevista fue confirmada para el ")
                .append(formatDate(fecha));
        if (horario != null && !horario.isBlank()) {
            sb.append(" (" ).append(horario).append(")");
        }
        sb.append(". ¡Te esperamos!");
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
