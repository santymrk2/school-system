package edu.ecep.base_app.gestionacademica.application;

import edu.ecep.base_app.gestionacademica.domain.CalificacionTrimestral;
import edu.ecep.base_app.gestionacademica.domain.Trimestre;
import edu.ecep.base_app.gestionacademica.domain.TrimestreEstado;
import edu.ecep.base_app.identidad.application.PersonaAccountService;
import edu.ecep.base_app.identidad.domain.enums.UserRole;
import edu.ecep.base_app.gestionacademica.infrastructure.mapper.CalificacionTrimestralMapper;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.CalificacionTrimestralRepository;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.TrimestreRepository;
import edu.ecep.base_app.gestionacademica.presentation.dto.CalificacionTrimestralCreateDTO;
import edu.ecep.base_app.gestionacademica.presentation.dto.CalificacionTrimestralDTO;
import edu.ecep.base_app.shared.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CalificacionTrimestralService {

    private final CalificacionTrimestralRepository repo;
    private final CalificacionTrimestralMapper mapper;
    private final TrimestreRepository trimRepo;
    private final DocenteScopeService docenteScopeService;
    private final PersonaAccountService personaAccountService;

    public List<CalificacionTrimestralDTO> findAll() {
        List<CalificacionTrimestral> entities = repo.findAll();
        Optional<DocenteScopeService.DocenteScope> scopeOpt = docenteScopeService.getScope();
        if (scopeOpt.isPresent()) {
            DocenteScopeService.DocenteScope scope = scopeOpt.get();
            entities = entities.stream()
                    .filter(e -> scope.puedeGestionarSeccionMateria(e.getSeccionMateria().getId()))
                    .toList();
        } else if (docenteScopeService.isTeacher()) {
            return List.of();
        }
        return entities.stream().map(mapper::toDto).toList();
    }

    public CalificacionTrimestralDTO get(Long id) {
        CalificacionTrimestral entity = repo.findById(id)

                .orElseThrow(() -> new NotFoundException("No encontrado"));
        docenteScopeService.ensurePuedeGestionarSeccionMateria(entity.getSeccionMateria().getId());
        return mapper.toDto(entity);
    }

    @Transactional
    public Long create(CalificacionTrimestralCreateDTO dto) {
        Trimestre tri = trimRepo.findById(dto.getTrimestreId())
                .orElseThrow(() -> new NotFoundException("No encontrado"));
        if (tri.getEstado() != TrimestreEstado.ACTIVO) {
            throw new IllegalArgumentException("El trimestre no está activo");
        }
        docenteScopeService.ensurePuedeGestionarSeccionMateria(dto.getSeccionMateriaId());
        if (repo.existsByTrimestreIdAndSeccionMateriaIdAndMatriculaId(
                dto.getTrimestreId(), dto.getSeccionMateriaId(), dto.getMatriculaId())) {
            throw new IllegalArgumentException("Calificación trimestral duplicada");
        }
        return repo.save(mapper.toEntity(dto)).getId();
    }

    @Transactional
    public void update(Long id, CalificacionTrimestralDTO dto) {
        CalificacionTrimestral entity = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("No encontrado"));
        docenteScopeService.ensurePuedeGestionarSeccionMateria(entity.getSeccionMateria().getId());

        Long targetTriId = dto.getTrimestreId() != null
                ? dto.getTrimestreId()
                : entity.getTrimestre().getId();
        Trimestre tri = trimRepo.findById(targetTriId)
                .orElseThrow(() -> new NotFoundException("No encontrado"));
        if (tri.getEstado() != TrimestreEstado.ACTIVO) {
            throw new IllegalArgumentException("El trimestre no está activo");
        }
        if (dto.getSeccionMateriaId() != null
                && !dto.getSeccionMateriaId().equals(entity.getSeccionMateria().getId())) {
            docenteScopeService.ensurePuedeGestionarSeccionMateria(dto.getSeccionMateriaId());
        }

        mapper.update(entity, dto);
        repo.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        CalificacionTrimestral entity = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("No encontrado"));
        docenteScopeService.ensurePuedeGestionarSeccionMateria(entity.getSeccionMateria().getId());
        repo.delete(entity);
    }

    private boolean shouldRestrictToClosedTrimestres() {
        try {
            var persona = personaAccountService.getCurrentPersona();
            if(persona == null || persona.getRoles() == null || persona.getRoles().isEmpty()) {
                return false;
            }
            if(!persona.getRoles().contains(UserRole.FAMILY)) {
                return false;
            }
            for (UserRole role : persona.getRoles()) {
                if(role != UserRole.FAMILY && role != UserRole.USER) {
                    return false;
                }
            }
            return true;
        } catch (ResponseStatusException ex) {
            return false;
        }
    }
}
