package edu.ecep.base_app.identidad.application;

import edu.ecep.base_app.admisiones.domain.Aspirante;
import edu.ecep.base_app.admisiones.infrastructure.persistence.AspiranteRepository;
import edu.ecep.base_app.gestionacademica.domain.Seccion;
import edu.ecep.base_app.identidad.domain.Alumno;
import edu.ecep.base_app.identidad.infrastructure.mapper.AlumnoMapper;
import edu.ecep.base_app.identidad.infrastructure.persistence.AlumnoFamiliarRepository;
import edu.ecep.base_app.identidad.infrastructure.persistence.AlumnoRepository;
import edu.ecep.base_app.identidad.infrastructure.persistence.PersonaRepository;
import edu.ecep.base_app.identidad.presentation.dto.AlumnoDTO;
import edu.ecep.base_app.shared.exception.NotFoundException;
import edu.ecep.base_app.vidaescolar.domain.Matricula;
import edu.ecep.base_app.vidaescolar.infrastructure.persistence.MatriculaRepository;
import edu.ecep.base_app.vidaescolar.infrastructure.persistence.MatriculaSeccionHistorialRepository;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import edu.ecep.base_app.shared.exception.ReferencedException;
import edu.ecep.base_app.shared.exception.ReferencedWarning;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


import lombok.RequiredArgsConstructor;

import edu.ecep.base_app.identidad.domain.Persona;
import edu.ecep.base_app.identidad.domain.enums.UserRole;
@Service @RequiredArgsConstructor
public class AlumnoService {

    private final AlumnoRepository alumnoRepository;
    private final MatriculaRepository matriculaRepository;
    private final MatriculaSeccionHistorialRepository matriculaSeccionHistorialRepository;
    private final AlumnoFamiliarRepository alumnoFamiliarRepository;
    private final AspiranteRepository aspiranteRepository;
    private final AlumnoMapper alumnoMapper;
    private final PersonaRepository personaRepository;

    public List<AlumnoDTO> findAll() {
        return alumnoRepository.findAllBy(Sort.by("id"))
                .stream()
                .map(a -> {
                    AlumnoDTO dto = alumnoMapper.toDto(a);
                    applySeccionActual(dto, a.getId());
                    return dto;
                })
                .toList();
    }

    public Page<AlumnoDTO> findPaged(Pageable pageable, String search, Long seccionId) {
        String normalized = (search != null && !search.isBlank()) ? search.trim().toLowerCase() : null;
        String likeTerm = normalized != null ? "%" + normalized + "%" : null;
        LocalDate hoy = LocalDate.now();

        Pageable effectivePageable = pageable;
        if (pageable.getSort().isUnsorted()) {
            Sort defaultSort = Sort.by(
                    Sort.Order.by("persona.apellido").ignoreCase(),
                    Sort.Order.by("persona.nombre").ignoreCase(),
                    Sort.Order.by("id"));
            effectivePageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), defaultSort);
        }

        return alumnoRepository.searchPaged(likeTerm, seccionId, hoy, effectivePageable)
                .map(a -> {
                    AlumnoDTO dto = alumnoMapper.toDto(a);
                    applySeccionActual(dto, a.getId());
                    return dto;
                });
    }

    public AlumnoDTO get(Long id) {
        return alumnoRepository.findWithPersonaById(id)
                .map(entity -> {
                    AlumnoDTO dto = alumnoMapper.toDto(entity);
                    applySeccionActual(dto, entity.getId());
                    return dto;
                })
                .orElseThrow(() -> new NotFoundException("Alumno no encontrado"));
    }

    @Transactional
    public Long create(AlumnoDTO dto) {
        // 1) Validar persona existente
        var persona = personaRepository.findById(dto.getPersonaId())
                .orElseThrow(() -> new NotFoundException("Persona no encontrada"));

        // 2) Evitar duplicado: una persona no puede ser Alumno dos veces
        if (alumnoRepository.existsByPersonaId(persona.getId())) {
            throw new IllegalArgumentException("La persona ya tiene rol Alumno");
        }

        // 3) Mapear y setear la relación de forma explícita
        var entity = alumnoMapper.toEntity(dto);
        entity.setPersona(persona);

        ensurePersonaHasRole(persona, UserRole.STUDENT);
        personaRepository.save(persona);

        upsertAspiranteForPersona(persona, dto);

        return alumnoRepository.save(entity).getId();
    }

    @Transactional
    public void update(Long id, AlumnoDTO dto) {
        var existing = alumnoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Alumno no encontrado"));

        // Si cambian la persona vinculada, validar existencia + no duplicar
        if (dto.getPersonaId() != null &&
                (existing.getPersona() == null ||
                        !dto.getPersonaId().equals(existing.getPersona().getId()))) {

            var persona = personaRepository.findById(dto.getPersonaId())
                    .orElseThrow(() -> new NotFoundException("Persona no encontrada"));

            // Si esa persona ya es alumno y no es el mismo registro, rechazar
            var alumnoConPersona = alumnoRepository.findByPersonaId(persona.getId());
            if (alumnoConPersona.isPresent() &&
                    !alumnoConPersona.get().getId().equals(existing.getId())) {
                throw new IllegalArgumentException("La persona ya tiene rol Alumno");
            }
            existing.setPersona(persona);
            ensurePersonaHasRole(persona, UserRole.STUDENT);
            personaRepository.save(persona);
        }

        // actualizar otros campos del alumno
        alumnoMapper.update(existing, dto);

        if (existing.getPersona() != null) {
            ensurePersonaHasRole(existing.getPersona(), UserRole.STUDENT);
            personaRepository.save(existing.getPersona());
            upsertAspiranteForPersona(existing.getPersona(), dto);
        }
        alumnoRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        ReferencedWarning warning = getReferencedWarning(id);
        if (warning != null) throw new ReferencedException(warning);
        if (!alumnoRepository.existsById(id)) {
            throw new NotFoundException("Alumno no encontrado: " + id);
        }
        alumnoRepository.deleteById(id);
    }

    private void applySeccionActual(AlumnoDTO dto, Long alumnoId) {
        dto.setSeccionActualId(null);
        dto.setSeccionActualNombre(null);
        dto.setSeccionActualTurno(null);
        if (alumnoId == null) {
            return;
        }
        LocalDate hoy = LocalDate.now();
        var matriculas = matriculaRepository.findByAlumnoId(alumnoId);
        for (Matricula matricula : matriculas) {
            var vigentes = matriculaSeccionHistorialRepository.findVigente(matricula.getId(), hoy);
            if (!vigentes.isEmpty()) {
                var msh = vigentes.get(0);
                var seccion = msh.getSeccion();
                if (seccion != null) {
                    dto.setSeccionActualId(seccion.getId());
                    dto.setSeccionActualNombre(buildNombreSeccion(seccion));
                    dto.setSeccionActualTurno(seccion.getTurno() != null ? seccion.getTurno().name() : null);
                }
                return;
            }
        }
    }

    private String buildNombreSeccion(Seccion seccion) {
        StringBuilder sb = new StringBuilder();
        if (seccion.getGradoSala() != null) {
            sb.append(seccion.getGradoSala());
        }
        if (seccion.getDivision() != null) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(seccion.getDivision());
        }
        return sb.length() > 0 ? sb.toString() : "";
    }

    public ReferencedWarning getReferencedWarning(Long id) {
        // ⚠️ requiere repo: boolean existsByAlumnoId(Long alumnoId)
        if (matriculaRepository.existsByAlumnoId(id)) {
            ReferencedWarning w = new ReferencedWarning("alumno.referenciado.matriculas");
            w.addParam(id);
            return w;
        }
        // ⚠️ requiere repo: boolean existsByAlumnoId(Long alumnoId)
        if (alumnoFamiliarRepository.existsByAlumnoId(id)) {
            ReferencedWarning w = new ReferencedWarning("alumno.referenciado.familiares");
            w.addParam(id);
            return w;
        }
        return null;
    }

    private void upsertAspiranteForPersona(Persona persona, AlumnoDTO dto) {
        if (persona == null || dto == null) {
            return;
        }
        Aspirante aspirante = aspiranteRepository.findByPersonaId(persona.getId())
                .orElseGet(() -> {
                    Aspirante nuevo = new Aspirante();
                    nuevo.setId(persona.getId());
                    nuevo.setPersona(persona);
                    return nuevo;
                });
        aspirante.setConectividadInternet(dto.getConectividadInternet());
        aspirante.setDispositivosDisponibles(dto.getDispositivosDisponibles());
        aspirante.setIdiomasHabladosHogar(dto.getIdiomasHabladosHogar());
        aspirante.setEnfermedadesAlergias(dto.getEnfermedadesAlergias());
        aspirante.setMedicacionHabitual(dto.getMedicacionHabitual());
        aspirante.setLimitacionesFisicas(dto.getLimitacionesFisicas());
        aspirante.setTratamientosTerapeuticos(dto.getTratamientosTerapeuticos());
        aspirante.setUsoAyudasMovilidad(dto.getUsoAyudasMovilidad());
        aspirante.setCoberturaMedica(dto.getCoberturaMedica());
        aspirante.setObservacionesSalud(dto.getObservacionesSalud());
        aspiranteRepository.save(aspirante);
    }

    private void ensurePersonaHasRole(Persona persona, UserRole role) {
        if (persona == null) {
            return;
        }
        Set<UserRole> roles = persona.getRoles();
        if (roles == null) {
            roles = new HashSet<>();
            persona.setRoles(roles);
        }
        if (!roles.contains(role)) {
            roles.add(role);
        }
    }
}
