package edu.ecep.base_app.asistencias.application;

import edu.ecep.base_app.asistencias.domain.JornadaAsistencia;
import edu.ecep.base_app.asistencias.infrastructure.mapper.JornadaAsistenciaMapper;
import edu.ecep.base_app.asistencias.infrastructure.persistence.JornadaAsistenciaRepository;
import edu.ecep.base_app.asistencias.presentation.dto.JornadaAsistenciaCreateDTO;
import edu.ecep.base_app.asistencias.presentation.dto.JornadaAsistenciaDTO;
import edu.ecep.base_app.gestionacademica.application.DocenteScopeService;
import edu.ecep.base_app.gestionacademica.domain.Trimestre;
import edu.ecep.base_app.gestionacademica.domain.TrimestreEstado;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.TrimestreRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class JornadaAsistenciaService {

    private final JornadaAsistenciaRepository repo;
    private final JornadaAsistenciaMapper mapper;
    private final TrimestreRepository trimRepo;
    private final DocenteScopeService docenteScopeService;

    public List<JornadaAsistenciaDTO> findAll() {
        List<JornadaAsistenciaDTO> jornadas = repo.findAll(Sort.by("fecha").descending())
                .stream()
                .map(mapper::toDto)
                .toList();
        Optional<DocenteScopeService.DocenteScope> scopeOpt = docenteScopeService.getScope();
        if (scopeOpt.isPresent()) {
            Set<Long> secciones = scopeOpt.get().seccionesAccesibles();
            if (secciones.isEmpty()) {
                return List.of();
            }
            return jornadas.stream()
                    .filter(dto -> secciones.contains(dto.getSeccionId()))
                    .toList();
        } else if (docenteScopeService.isTeacher()) {
            return List.of();
        }
        return jornadas;
    }

    @Transactional(readOnly = true)
    public Optional<JornadaAsistenciaDTO> findBySeccionAndFecha(Long seccionId, LocalDate fecha) {
        docenteScopeService.ensurePuedeAccederSeccion(seccionId);
        return repo.findBySeccionIdAndFecha(seccionId, fecha).map(mapper::toDto);
    }

    @Transactional
    public Long abrir(JornadaAsistenciaCreateDTO dto) {
        docenteScopeService.ensurePuedeAccederSeccion(dto.getSeccionId());
        if (repo.existsBySeccionIdAndFecha(dto.getSeccionId(), dto.getFecha())) {
            throw new IllegalArgumentException("Ya existe una jornada para esa sección y fecha");
        }
        Trimestre tri = trimRepo.findById(dto.getTrimestreId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trimestre no encontrado"));
        if (tri.getEstado() != TrimestreEstado.ACTIVO) {
            throw new IllegalArgumentException("El trimestre no está activo");
        }
        return repo.save(mapper.toEntity(dto)).getId();
    }

    @Transactional(readOnly = true)
    public JornadaAsistenciaDTO get(Long id) {
        JornadaAsistencia jornada = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Jornada " + id + " no encontrada"));
        docenteScopeService.ensurePuedeAccederSeccion(jornada.getSeccion().getId());
        return mapper.toDto(jornada);
    }

    public List<JornadaAsistenciaDTO> findBySeccion(Long seccionId) {
        docenteScopeService.ensurePuedeAccederSeccion(seccionId);
        return repo.findBySeccionId(seccionId).stream().map(mapper::toDto).toList();
    }

    public List<JornadaAsistenciaDTO> findBySeccionBetween(Long seccionId, LocalDate from, LocalDate to) {
        docenteScopeService.ensurePuedeAccederSeccion(seccionId);
        return repo.findBySeccionIdAndFechaBetween(seccionId, from, to)
                .stream().map(mapper::toDto).toList();
    }

    public List<JornadaAsistenciaDTO> findByTrimestre(Long trimestreId) {
        List<JornadaAsistenciaDTO> jornadas = repo.findByTrimestreId(trimestreId)
                .stream().map(mapper::toDto).toList();
        Optional<DocenteScopeService.DocenteScope> scopeOpt = docenteScopeService.getScope();
        if (scopeOpt.isPresent()) {
            Set<Long> secciones = scopeOpt.get().seccionesAccesibles();
            if (secciones.isEmpty()) {
                return List.of();
            }
            return jornadas.stream()
                    .filter(dto -> secciones.contains(dto.getSeccionId()))
                    .toList();
        } else if (docenteScopeService.isTeacher()) {
            return List.of();
        }
        return jornadas;
    }

    @Transactional
    public void delete(Long id) {
        JornadaAsistencia jornada = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Jornada " + id + " no encontrada"));
        docenteScopeService.ensurePuedeAccederSeccion(jornada.getSeccion().getId());
        repo.deleteById(id);
    }
}
