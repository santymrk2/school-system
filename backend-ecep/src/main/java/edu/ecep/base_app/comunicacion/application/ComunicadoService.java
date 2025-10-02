package edu.ecep.base_app.comunicacion.application;

import edu.ecep.base_app.comunicacion.domain.Comunicado;
import edu.ecep.base_app.comunicacion.domain.ComunicadoLectura;
import edu.ecep.base_app.comunicacion.domain.enums.AlcanceComunicado;
import edu.ecep.base_app.comunicacion.domain.enums.EstadoLecturaComunicado;
import edu.ecep.base_app.comunicacion.infrastructure.mapper.ComunicadoMapper;
import edu.ecep.base_app.comunicacion.infrastructure.persistence.ComunicadoLecturaRepository;
import edu.ecep.base_app.comunicacion.infrastructure.persistence.ComunicadoRepository;
import edu.ecep.base_app.comunicacion.presentation.dto.ComunicadoCreateDTO;
import edu.ecep.base_app.comunicacion.presentation.dto.ComunicadoDTO;
import edu.ecep.base_app.comunicacion.presentation.dto.ComunicadoLecturaResumenDTO;
import edu.ecep.base_app.identidad.application.PersonaAccountService;
import edu.ecep.base_app.identidad.domain.Persona;
import edu.ecep.base_app.identidad.domain.enums.UserRole;
import edu.ecep.base_app.identidad.infrastructure.persistence.AlumnoFamiliarRepository;
import edu.ecep.base_app.identidad.infrastructure.persistence.PersonaRepository;
import edu.ecep.base_app.shared.exception.NotFoundException;
import edu.ecep.base_app.vidaescolar.infrastructure.persistence.MatriculaSeccionHistorialRepository;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;


@Service @RequiredArgsConstructor
public class ComunicadoService {
    private final ComunicadoRepository repo;
    private final ComunicadoMapper mapper;
    private final ComunicadoLecturaRepository lecturaRepository;
    private final PersonaAccountService personaAccountService;
    private final PersonaRepository personaRepository;
    private final AlumnoFamiliarRepository alumnoFamiliarRepository;
    private final MatriculaSeccionHistorialRepository matriculaSeccionHistorialRepository;
    public List<ComunicadoDTO> findAll(){
        return repo.findByActivoTrueOrderByIdDesc().stream().map(mapper::toDto).toList();
    }
    public ComunicadoDTO get(Long id){
        return repo.findByIdAndActivoTrue(id).map(mapper::toDto).orElseThrow(NotFoundException::new);
    }
    public Long create(ComunicadoCreateDTO dto){
        // Validaciones condicionales por alcance
        if(dto.getAlcance()==AlcanceComunicado.POR_SECCION && dto.getSeccionId()==null) throw new IllegalArgumentException("Sección requerida");
        if(dto.getAlcance()== AlcanceComunicado.POR_NIVEL && dto.getNivel()==null) throw new IllegalArgumentException("Nivel requerido");
        return repo.save(mapper.toEntity(dto)).getId();
    }

    public void update(Long id, ComunicadoDTO dto){
        var entity = repo.findByIdAndActivoTrue(id).orElseThrow(NotFoundException::new);
        mapper.update(entity, dto);
        repo.save(entity);
    }

    public void delete(Long id){
        var entity = repo.findByIdAndActivoTrue(id).orElseThrow(NotFoundException::new);
        repo.delete(entity);
    }

    @Transactional
    public void registrarLectura(Long comunicadoId) {
        var persona = personaAccountService.getCurrentPersona();
        validarRolLectura(persona);
        var comunicado = repo.findByIdAndActivoTrue(comunicadoId)
                .orElseThrow(NotFoundException::new);

        ComunicadoLectura lectura = lecturaRepository
                .findTopByComunicadoIdAndPersonaIdAndActivoTrueOrderByFechaLecturaDesc(comunicadoId, persona.getId())
                .orElseGet(() -> {
                    ComunicadoLectura nueva = new ComunicadoLectura();
                    nueva.setComunicado(comunicado);
                    nueva.setPersona(persona);
                    return nueva;
                });
        lectura.setEstado(EstadoLecturaComunicado.CONFIRMADA);
        lectura.setFechaLectura(OffsetDateTime.now());
        lecturaRepository.save(lectura);
    }

    @Transactional(readOnly = true)
    public ComunicadoLecturaResumenDTO obtenerResumenLecturas(Long comunicadoId) {
        var persona = personaAccountService.getCurrentPersona();
        var comunicado = repo.findByIdAndActivoTrue(comunicadoId)
                .orElseThrow(NotFoundException::new);

        Set<Long> destinatarios = resolveDestinatarios(comunicado);
        long totalDestinatarios = destinatarios.size();

        long confirmadas = lecturaRepository.countByEstado(comunicadoId).stream()
                .filter(c -> c.getEstado() == EstadoLecturaComunicado.CONFIRMADA)
                .mapToLong(ComunicadoLecturaRepository.LecturaEstadoCount::getTotal)
                .sum();

        long pendientes = Math.max(totalDestinatarios - confirmadas, 0);
        OffsetDateTime ultimaLectura = lecturaRepository.findUltimaLectura(comunicadoId, EstadoLecturaComunicado.CONFIRMADA);

        var lecturaPersonal = lecturaRepository
                .findTopByComunicadoIdAndPersonaIdAndActivoTrueOrderByFechaLecturaDesc(comunicadoId, persona.getId());

        boolean confirmadoPorMi = lecturaPersonal
                .map(ComunicadoLectura::getEstado)
                .map(EstadoLecturaComunicado.CONFIRMADA::equals)
                .orElse(false);

        OffsetDateTime miFechaLectura = lecturaPersonal
                .map(ComunicadoLectura::getFechaLectura)
                .orElse(null);

        return new ComunicadoLecturaResumenDTO(
                comunicadoId,
                totalDestinatarios,
                confirmadas,
                pendientes,
                ultimaLectura,
                confirmadoPorMi,
                miFechaLectura
        );
    }

    private void validarRolLectura(Persona persona) {
        Set<UserRole> roles = persona.getRoles();
        boolean autorizado = roles != null && roles.stream()
                .anyMatch(role -> role == UserRole.FAMILY || role == UserRole.STUDENT);
        if (!autorizado) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Rol no autorizado para confirmar lecturas");
        }
    }

    private Set<Long> resolveDestinatarios(Comunicado comunicado) {
        if (comunicado.getAlcance() == null) {
            return Set.of();
        }
        LocalDate hoy = LocalDate.now();
        return switch (comunicado.getAlcance()) {
            case INSTITUCIONAL -> {
                Set<Long> ids = personaRepository.findActiveIdsByRole(UserRole.FAMILY);
                yield ids == null ? Set.of() : ids;
            }
            case POR_NIVEL -> comunicado.getNivel() == null
                    ? Set.of()
                    : familiaPorAlumnoIds(
                            matriculaSeccionHistorialRepository.findAlumnoIdsByNivelOnDate(comunicado.getNivel(), hoy)
                    );
            case POR_SECCION -> comunicado.getSeccion() == null
                    ? Set.of()
                    : familiaPorAlumnoIds(
                            matriculaSeccionHistorialRepository.findAlumnoIdsBySeccionOnDate(
                                    comunicado.getSeccion().getId(), hoy)
                    );
        };
    }

    private Set<Long> familiaPorAlumnoIds(Set<Long> alumnoIds) {
        if (alumnoIds == null || alumnoIds.isEmpty()) {
            return Set.of();
        }
        Set<Long> personas = alumnoFamiliarRepository.findPersonaIdsByAlumnoIds(alumnoIds);
        return personas == null ? Set.of() : personas;
    }
}
