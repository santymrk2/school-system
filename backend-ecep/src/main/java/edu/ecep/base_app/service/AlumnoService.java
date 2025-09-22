package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.*;
import edu.ecep.base_app.dtos.AlumnoDTO;
import edu.ecep.base_app.mappers.AlumnoMapper;
import edu.ecep.base_app.repos.AlumnoFamiliarRepository;
import edu.ecep.base_app.repos.AlumnoRepository;
import edu.ecep.base_app.repos.MatriculaRepository;
import edu.ecep.base_app.repos.MatriculaSeccionHistorialRepository;
import edu.ecep.base_app.repos.PersonaRepository;
import edu.ecep.base_app.util.NotFoundException;

import java.time.LocalDate;
import java.util.List;

import edu.ecep.base_app.util.ReferencedException;
import edu.ecep.base_app.util.ReferencedWarning;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


import edu.ecep.base_app.domain.Alumno;
import lombok.RequiredArgsConstructor;


@Service @RequiredArgsConstructor
public class AlumnoService {

    private final AlumnoRepository alumnoRepository;
    private final MatriculaRepository matriculaRepository;
    private final MatriculaSeccionHistorialRepository matriculaSeccionHistorialRepository;
    private final AlumnoFamiliarRepository alumnoFamiliarRepository;
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
        }

        // actualizar otros campos del alumno
        alumnoMapper.update(existing, dto);
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
        if (seccion.getTurno() != null) {
            sb.append(" (" + seccion.getTurno() + ")");
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
}
