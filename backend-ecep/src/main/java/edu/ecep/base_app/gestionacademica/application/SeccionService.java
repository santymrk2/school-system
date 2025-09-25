package edu.ecep.base_app.gestionacademica.application;

import edu.ecep.base_app.gestionacademica.application.DocenteScopeService.DocenteScope;
import edu.ecep.base_app.gestionacademica.infrastructure.mapper.SeccionMapper;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.SeccionRepository;
import edu.ecep.base_app.gestionacademica.presentation.dto.SeccionCreateDTO;
import edu.ecep.base_app.gestionacademica.presentation.dto.SeccionDTO;
import edu.ecep.base_app.shared.exception.NotFoundException;
import edu.ecep.base_app.shared.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SeccionService {

    private final SeccionRepository repo;
    private final SeccionMapper mapper;
    private final DocenteScopeService docenteScopeService;

    public List<SeccionDTO> findAll() {
        List<edu.ecep.base_app.gestionacademica.domain.Seccion> secciones = repo.findAll(
                Sort.by("periodoEscolar.id", "nivel", "gradoSala", "division"));

        Optional<DocenteScope> scopeOpt = docenteScopeService.getScope();
        if (scopeOpt.isPresent()) {
            DocenteScope scope = scopeOpt.get();
            Set<Long> accesibles = scope.seccionesAccesibles();
            if (accesibles.isEmpty()) {
                return List.of();
            }
            secciones = secciones.stream()
                    .filter(seccion -> accesibles.contains(seccion.getId()))
                    .toList();
        } else if (docenteScopeService.isTeacher()) {
            return List.of();
        }

        return secciones.stream().map(mapper::toDto).toList();
    }

    public Long create(SeccionCreateDTO dto) {
        ensureNoTeacherModification();
        if (repo.existsByPeriodoEscolarIdAndNivelAndGradoSalaAndDivisionAndTurno(
                dto.getPeriodoEscolarId(), dto.getNivel(), dto.getGradoSala(), dto.getDivision(), dto.getTurno())) {
            throw new IllegalArgumentException("La sección ya existe en ese periodo");
        }
        return repo.save(mapper.toEntity(dto)).getId();
    }

    public SeccionDTO get(Long id) {
        docenteScopeService.ensurePuedeAccederSeccion(id);
        return repo.findById(id)
                .map(mapper::toDto)
                .orElseThrow(NotFoundException::new);
    }

    public void update(Long id, SeccionDTO dto) {
        ensureNoTeacherModification();
        var entity = repo.findById(id).orElseThrow(NotFoundException::new);
        mapper.update(entity, dto);
        repo.save(entity);
    }

    public void delete(Long id) {
        ensureNoTeacherModification();
        if (!repo.existsById(id)) {
            throw new NotFoundException();
        }
        repo.deleteById(id);
    }

    private void ensureNoTeacherModification() {
        if (docenteScopeService.isTeacher()) {
            throw new UnauthorizedException("No tiene permisos para modificar secciones.");
        }
    }
}
