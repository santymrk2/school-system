package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.Evaluacion;
import edu.ecep.base_app.domain.Trimestre;
import edu.ecep.base_app.domain.TrimestreEstado;
import edu.ecep.base_app.dtos.EvaluacionCreateDTO;
import edu.ecep.base_app.dtos.EvaluacionDTO;
import edu.ecep.base_app.mappers.EvaluacionMapper;
import edu.ecep.base_app.repos.EvaluacionRepository;
import edu.ecep.base_app.repos.MatriculaSeccionHistorialRepository;
import edu.ecep.base_app.repos.TrimestreRepository;
import edu.ecep.base_app.util.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EvaluacionService {
    private final EvaluacionRepository repo; private final EvaluacionMapper mapper; private final MatriculaSeccionHistorialRepository histRepo; private final TrimestreRepository trimRepo;

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

        List<Evaluacion> result = (spec == null)
                ? repo.findAll(Sort.by("fecha").descending())
                : repo.findAll(spec, Sort.by("fecha").descending());

        return result.stream().map(mapper::toDto).toList();
    }
    public EvaluacionDTO get(Long id){
        return repo.findById(id)
                .map(mapper::toDto)
                .orElseThrow(() -> new NotFoundException("No encontrado"));
    }
    public Long create(EvaluacionCreateDTO dto){
        Trimestre tri = trimRepo.findById(dto.getTrimestreId()).orElseThrow(() -> new NotFoundException("No encontrado"));
        if(tri.getEstado() != TrimestreEstado.ACTIVO) {
            throw new IllegalArgumentException("El trimestre no está activo");
        }
        return repo.save(mapper.toEntity(dto)).getId();
    }
    public void update(Long id, EvaluacionDTO dto){
        var entity = repo.findById(id).orElseThrow(() -> new NotFoundException("No encontrado"));
        Long targetTriId = dto.getTrimestreId() != null ? dto.getTrimestreId() : entity.getTrimestre().getId();
        Trimestre tri = trimRepo.findById(targetTriId).orElseThrow(() -> new NotFoundException("No encontrado"));
        if(tri.getEstado() != TrimestreEstado.ACTIVO) {
            throw new IllegalArgumentException("El trimestre no está activo");
        }
        mapper.update(entity, dto);
        repo.save(entity);
    }
    public void delete(Long id){
        if(!repo.existsById(id)) throw new NotFoundException("No encontrado");
        repo.deleteById(id);
    }
}
