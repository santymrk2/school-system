package edu.ecep.base_app.gestionacademica.application;

import edu.ecep.base_app.gestionacademica.application.DocenteScopeService.DocenteScope;
import edu.ecep.base_app.gestionacademica.domain.AsignacionDocenteSeccion;
import edu.ecep.base_app.gestionacademica.domain.enums.RolSeccion;
import edu.ecep.base_app.gestionacademica.presentation.dto.AsignacionDocenteSeccionCreateDTO;
import edu.ecep.base_app.gestionacademica.presentation.dto.AsignacionDocenteSeccionDTO;
import edu.ecep.base_app.gestionacademica.infrastructure.mapper.AsignacionDocenteSeccionMapper;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.AsignacionDocenteSeccionRepository;
import edu.ecep.base_app.shared.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AsignacionDocenteSeccionService {

    private final AsignacionDocenteSeccionRepository repo;
    private final AsignacionDocenteSeccionMapper mapper;
    private final DocenteScopeService docenteScopeService;

    @Transactional(readOnly = true)
    public List<AsignacionDocenteSeccionDTO> findAll() {
        List<AsignacionDocenteSeccionDTO> asignaciones = repo.findAll().stream()
                .map(mapper::toDto)
                .toList();

        Optional<DocenteScope> scopeOpt = docenteScopeService.getScope();
        if (scopeOpt.isPresent()) {
            DocenteScope scope = scopeOpt.get();
            Set<Long> accesibles = scope.seccionesAccesibles();
            if (accesibles.isEmpty()) {
                return List.of();
            }
            asignaciones = asignaciones.stream()
                    .filter(dto -> accesibles.contains(dto.getSeccionId()))
                    .toList();
        } else if (docenteScopeService.isTeacher()) {
            return List.of();
        }

        return asignaciones;
    }

    @Transactional(readOnly = true)
    public List<AsignacionDocenteSeccionDTO> findBySeccion(Long seccionId) {
        docenteScopeService.ensurePuedeAccederSeccion(seccionId);
        return repo.findBySeccion_Id(seccionId).stream()
                .map(mapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AsignacionDocenteSeccionDTO> findVigentesByEmpleado(Long empleadoId, LocalDate fecha) {
        Optional<DocenteScope> scopeOpt = docenteScopeService.getScope();
        if (scopeOpt.isPresent() && !scopeOpt.get().empleadoId().equals(empleadoId)) {
            throw new UnauthorizedException("No tiene permisos para consultar las asignaciones del docente indicado.");
        } else if (scopeOpt.isEmpty() && docenteScopeService.isTeacher()) {
            throw new UnauthorizedException("No tiene permisos para consultar las asignaciones del docente indicado.");
        }

        LocalDate targetDate = fecha != null ? fecha : LocalDate.now();
        return repo.findVigentesByEmpleado(empleadoId, targetDate).stream()
                .map(mapper::toDto)
                .toList();
    }

    @Transactional
    public Long create(AsignacionDocenteSeccionCreateDTO dto) {
        ensureTeacherCannotAssign();

        LocalDate desde = dto.getVigenciaDesde();
        if (desde == null) {
            desde = LocalDate.now();
        }

        RolSeccion rol = dto.getRol();
        LocalDate hasta = dto.getVigenciaHasta();

        if (rol == RolSeccion.SUPLENTE) {
            if (hasta == null) {
                throw new IllegalArgumentException("La suplencia debe tener una fecha de finalización.");
            }
            if (hasta.isBefore(desde)) {
                throw new IllegalArgumentException("La fecha hasta no puede ser anterior a la fecha desde.");
            }
        } else if (rol == RolSeccion.MAESTRO_TITULAR) {
            hasta = null;
            LocalDate cierre = desde.minusDays(1);
            for (AsignacionDocenteSeccion vigente : repo.findTitularesVigentesEn(dto.getSeccionId(), desde)) {
                vigente.setVigenciaHasta(cierre);
                repo.save(vigente);
            }
        }

        dto.setVigenciaDesde(desde);
        dto.setVigenciaHasta(hasta);

        LocalDate hastaValidacion = hasta == null ? LocalDate.of(9999, 12, 31) : hasta;
        if (rol == RolSeccion.MAESTRO_TITULAR
                && repo.hasTitularOverlap(dto.getSeccionId(), desde, hastaValidacion, null)) {
            throw new IllegalArgumentException("Ya hay un titular vigente en ese rango");
        }

        AsignacionDocenteSeccion entity = mapper.toEntity(dto);
        entity.setVigenciaDesde(desde);
        entity.setVigenciaHasta(hasta);
        return repo.save(entity).getId();
    }

    @Transactional
    public void delete(Long id) {
        ensureTeacherCannotAssign();
        repo.deleteById(id);
    }

    private void ensureTeacherCannotAssign() {
        if (docenteScopeService.isTeacher()) {
            throw new UnauthorizedException("No tiene permisos para asignar docentes a secciones.");
        }
    }
}
