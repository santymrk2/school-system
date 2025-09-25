package edu.ecep.base_app.gestionacademica.application;

import edu.ecep.base_app.gestionacademica.application.DocenteScopeService.DocenteScope;
import edu.ecep.base_app.gestionacademica.infrastructure.mapper.SeccionMateriaMapper;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.SeccionMateriaRepository;
import edu.ecep.base_app.gestionacademica.presentation.dto.SeccionMateriaCreateDTO;
import edu.ecep.base_app.gestionacademica.presentation.dto.SeccionMateriaDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SeccionMateriaService {

    private final SeccionMateriaRepository repo;
    private final SeccionMateriaMapper mapper;
    private final DocenteScopeService docenteScopeService;

    public List<SeccionMateriaDTO> findAll() {
        List<SeccionMateriaDTO> materias = repo.findAll().stream()
                .map(mapper::toDto)
                .toList();

        Optional<DocenteScope> scopeOpt = docenteScopeService.getScope();
        if (scopeOpt.isPresent()) {
            DocenteScope scope = scopeOpt.get();
            Set<Long> accesibles = scope.seccionesAccesibles();
            if (accesibles.isEmpty()) {
                return List.of();
            }
            materias = materias.stream()
                    .filter(dto -> accesibles.contains(dto.getSeccionId()))
                    .toList();
        } else if (docenteScopeService.isTeacher()) {
            return List.of();
        }

        return materias;
    }

    public Long create(SeccionMateriaCreateDTO dto) {
        docenteScopeService.ensurePuedeGestionarSeccion(dto.getSeccionId());
        if (repo.existsBySeccionIdAndMateriaId(dto.getSeccionId(), dto.getMateriaId())) {
            throw new IllegalArgumentException("Materia ya asignada al plan de estudio");
        }
        return repo.save(mapper.toEntity(dto)).getId();
    }
}