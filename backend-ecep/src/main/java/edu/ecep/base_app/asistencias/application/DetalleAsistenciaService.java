package edu.ecep.base_app.asistencias.application;

import edu.ecep.base_app.asistencias.domain.DetalleAsistencia;
import edu.ecep.base_app.asistencias.domain.JornadaAsistencia;
import edu.ecep.base_app.asistencias.infrastructure.mapper.DetalleAsistenciaMapper;
import edu.ecep.base_app.asistencias.infrastructure.persistence.DetalleAsistenciaRepository;
import edu.ecep.base_app.asistencias.infrastructure.persistence.JornadaAsistenciaRepository;
import edu.ecep.base_app.asistencias.presentation.dto.DetalleAsistenciaCreateDTO;
import edu.ecep.base_app.asistencias.presentation.dto.DetalleAsistenciaDTO;
import edu.ecep.base_app.asistencias.presentation.dto.DetalleAsistenciaUpdateDTO;
import edu.ecep.base_app.gestionacademica.application.DocenteScopeService;
import edu.ecep.base_app.gestionacademica.domain.TrimestreEstado;
import lombok.RequiredArgsConstructor;
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
public class DetalleAsistenciaService {

    private final DetalleAsistenciaRepository repo;
    private final JornadaAsistenciaRepository jornadaRepo;
    private final DetalleAsistenciaMapper mapper;
    private final DocenteScopeService docenteScopeService;

    public List<DetalleAsistenciaDTO> findAll() {
        List<DetalleAsistencia> detalles = repo.findAll();
        Optional<DocenteScopeService.DocenteScope> scopeOpt = docenteScopeService.getScope();
        if (scopeOpt.isPresent()) {
            Set<Long> secciones = scopeOpt.get().seccionesAccesibles();
            if (secciones.isEmpty()) {
                return List.of();
            }
            detalles = detalles.stream()
                    .filter(d -> secciones.contains(d.getJornada().getSeccion().getId()))
                    .toList();
        } else if (docenteScopeService.isTeacher()) {
            return List.of();
        }
        return detalles.stream().map(mapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public DetalleAsistenciaDTO get(Long id) {
        DetalleAsistencia detalle = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Detalle no encontrado"));
        docenteScopeService.ensurePuedeAccederSeccion(detalle.getJornada().getSeccion().getId());
        return mapper.toDto(detalle);
    }

    @Transactional
    public Long marcar(DetalleAsistenciaCreateDTO dto) {
        JornadaAsistencia jornada = jornadaRepo.findById(dto.getJornadaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Jornada no encontrada"));
        docenteScopeService.ensurePuedeAccederSeccion(jornada.getSeccion().getId());

        if (jornada.getTrimestre() != null && jornada.getTrimestre().getEstado() != TrimestreEstado.ACTIVO) {
            throw new IllegalArgumentException("El trimestre no está activo");
        }

        if (repo.existsByJornadaIdAndMatriculaId(dto.getJornadaId(), dto.getMatriculaId())) {
            throw new IllegalArgumentException("Ya hay registro para esa matrícula en esa jornada");
        }

        return repo.save(mapper.toEntity(dto)).getId();
    }

    @Transactional
    public void actualizarParcial(Long id, DetalleAsistenciaUpdateDTO dto) {
        DetalleAsistencia entity = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Detalle no encontrado"));
        docenteScopeService.ensurePuedeAccederSeccion(entity.getJornada().getSeccion().getId());
        entity.setEstado(dto.getEstado());
        entity.setObs(dto.getObservacion());
        repo.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        DetalleAsistencia entity = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Detalle no encontrado"));
        docenteScopeService.ensurePuedeAccederSeccion(entity.getJornada().getSeccion().getId());
        repo.delete(entity);
    }

    @Transactional(readOnly = true)
    public List<DetalleAsistenciaDTO> search(Long jornadaId, Long matriculaId,
                                             LocalDate from, LocalDate to) {
        List<DetalleAsistencia> res;
        if (jornadaId != null) {
            JornadaAsistencia jornada = jornadaRepo.findById(jornadaId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Jornada no encontrada"));
            docenteScopeService.ensurePuedeAccederSeccion(jornada.getSeccion().getId());
            res = repo.findByJornadaId(jornadaId);
        } else if (matriculaId != null && from != null && to != null) {
            res = repo.findByMatriculaIdAndJornada_FechaBetween(matriculaId, from, to);
        } else {
            res = repo.findAll();
        }

        Optional<DocenteScopeService.DocenteScope> scopeOpt = docenteScopeService.getScope();
        if (scopeOpt.isPresent()) {
            Set<Long> secciones = scopeOpt.get().seccionesAccesibles();
            if (secciones.isEmpty()) {
                return List.of();
            }
            res = res.stream()
                    .filter(d -> secciones.contains(d.getJornada().getSeccion().getId()))
                    .toList();
        } else if (docenteScopeService.isTeacher()) {
            return List.of();
        }

        return res.stream().map(mapper::toDto).toList();
    }
}
