package edu.ecep.base_app.gestionacademica.application;

import edu.ecep.base_app.gestionacademica.application.DocenteScopeService;
import edu.ecep.base_app.gestionacademica.application.DocenteScopeService.DocenteScope;
import edu.ecep.base_app.gestionacademica.domain.Evaluacion;
import edu.ecep.base_app.gestionacademica.domain.Trimestre;
import edu.ecep.base_app.gestionacademica.domain.TrimestreEstado;
import edu.ecep.base_app.gestionacademica.presentation.dto.EvaluacionCreateDTO;
import edu.ecep.base_app.gestionacademica.presentation.dto.EvaluacionDTO;
import edu.ecep.base_app.gestionacademica.infrastructure.mapper.EvaluacionMapper;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.EvaluacionRepository;
import edu.ecep.base_app.vidaescolar.infrastructure.persistence.MatriculaSeccionHistorialRepository;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.TrimestreRepository;
import edu.ecep.base_app.shared.exception.NotFoundException;
import edu.ecep.base_app.shared.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class EvaluacionService {
    private final EvaluacionRepository repo; private final EvaluacionMapper mapper; private final MatriculaSeccionHistorialRepository histRepo; private final TrimestreRepository trimRepo; private final DocenteScopeService docenteScopeService;

    public List<EvaluacionDTO> findAll(){
        return findAll(null, null, null);
    }

    public List<EvaluacionDTO> findAll(Long seccionId, Long trimestreId, Long materiaId){
        Specification<Evaluacion> spec = null;
        if (seccionId != null) {
            Specification<Evaluacion> bySeccion = (root, query, cb) ->
                    cb.equal(root.join("seccionMateria").join("seccion").get("id"), seccionId);
            spec = spec == null ? Specification.where(bySeccion) : spec.and(bySeccion);
        }
        if (trimestreId != null) {
            Specification<Evaluacion> byTrimestre = (root, query, cb) ->
                    cb.equal(root.join("trimestre").get("id"), trimestreId);
            spec = spec == null ? Specification.where(byTrimestre) : spec.and(byTrimestre);
        }
        if (materiaId != null) {
            Specification<Evaluacion> byMateria = (root, query, cb) ->
                    cb.equal(root.join("seccionMateria").join("materia").get("id"), materiaId);
            spec = spec == null ? Specification.where(byMateria) : spec.and(byMateria);
        }

        Specification<Evaluacion> effectiveSpec = spec;
        Optional<DocenteScope> scopeOpt = docenteScopeService.getScope();
        if (scopeOpt.isPresent()) {
            DocenteScope scope = scopeOpt.get();
            if (seccionId != null && !scope.puedeAccederSeccion(seccionId)) {
                throw new UnauthorizedException("No tiene permisos para acceder a la sección indicada.");
            }
            Specification<Evaluacion> docenteSpec = buildDocenteSpecification(scope);
            effectiveSpec = (effectiveSpec == null)
                    ? Specification.where(docenteSpec)
                    : effectiveSpec.and(docenteSpec);
        } else if (docenteScopeService.isTeacher()) {
            return List.of();
        }

        List<Evaluacion> result = (effectiveSpec == null)
                ? repo.findAll(Sort.by("fecha").descending())
                : repo.findAll(effectiveSpec, Sort.by("fecha").descending());

        return result.stream().map(mapper::toDto).toList();
    }
    public EvaluacionDTO get(Long id){
        Evaluacion evaluacion = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("No encontrado"));
        docenteScopeService.ensurePuedeGestionarEvaluacion(evaluacion);
        return mapper.toDto(evaluacion);
    }
    public Long create(EvaluacionCreateDTO dto){
        Trimestre tri = trimRepo.findById(dto.getTrimestreId()).orElseThrow(() -> new NotFoundException("No encontrado"));
        if(tri.getEstado() != TrimestreEstado.ACTIVO) {
            throw new IllegalArgumentException("El trimestre no está activo");
        }
        docenteScopeService.ensurePuedeGestionarSeccionMateria(dto.getSeccionMateriaId());
        return repo.save(mapper.toEntity(dto)).getId();
    }
    public void update(Long id, EvaluacionDTO dto){
        var entity = repo.findById(id).orElseThrow(() -> new NotFoundException("No encontrado"));
        docenteScopeService.ensurePuedeGestionarEvaluacion(entity);
        Long targetTriId = dto.getTrimestreId() != null ? dto.getTrimestreId() : entity.getTrimestre().getId();
        Trimestre tri = trimRepo.findById(targetTriId).orElseThrow(() -> new NotFoundException("No encontrado"));
        if(tri.getEstado() != TrimestreEstado.ACTIVO) {
            throw new IllegalArgumentException("El trimestre no está activo");
        }
        if (dto.getSeccionMateriaId() != null && !dto.getSeccionMateriaId().equals(entity.getSeccionMateria().getId())) {
            docenteScopeService.ensurePuedeGestionarSeccionMateria(dto.getSeccionMateriaId());
        }
        mapper.update(entity, dto);
        repo.save(entity);
    }
    public void delete(Long id){
        var entity = repo.findById(id).orElseThrow(() -> new NotFoundException("No encontrado"));
        docenteScopeService.ensurePuedeGestionarEvaluacion(entity);
        repo.delete(entity);
    }

    private Specification<Evaluacion> buildDocenteSpecification(DocenteScope scope) {
        Set<Long> seccionMateriaIds = scope.seccionMateriasGestionables();
        if (seccionMateriaIds.isEmpty()) {
            return (root, query, cb) -> cb.disjunction();
        }
        return (root, query, cb) -> root.join("seccionMateria").get("id").in(seccionMateriaIds);
    }
}
