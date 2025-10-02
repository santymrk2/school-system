package edu.ecep.base_app.gestionacademica.application;

import edu.ecep.base_app.gestionacademica.domain.Evaluacion;
import edu.ecep.base_app.gestionacademica.domain.TrimestreEstado;
import edu.ecep.base_app.vidaescolar.domain.MatriculaSeccionHistorial;
import edu.ecep.base_app.gestionacademica.presentation.dto.ResultadoEvaluacionCreateDTO;
import edu.ecep.base_app.gestionacademica.presentation.dto.ResultadoEvaluacionDTO;
import edu.ecep.base_app.gestionacademica.presentation.dto.ResultadoEvaluacionUpdateDTO;
import edu.ecep.base_app.gestionacademica.infrastructure.mapper.ResultadoEvaluacionMapper;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.EvaluacionRepository;
import edu.ecep.base_app.vidaescolar.infrastructure.persistence.MatriculaSeccionHistorialRepository;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.ResultadoEvaluacionRepository;
import edu.ecep.base_app.shared.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResultadoEvaluacionService {
    private final ResultadoEvaluacionRepository repo; private final ResultadoEvaluacionMapper mapper; private final EvaluacionRepository evalRepo; private final MatriculaSeccionHistorialRepository histRepo;
    public List<ResultadoEvaluacionDTO> findAll(){ return repo.findAll().stream().map(mapper::toDto).toList(); }

    public List<ResultadoEvaluacionDTO> findByEvaluacion(Long evaluacionId){
        return repo.findByEvaluacionId(evaluacionId).stream().map(mapper::toDto).toList();
    }

    @Transactional
    public Long create(ResultadoEvaluacionCreateDTO dto){
        Evaluacion e = evalRepo.findById(dto.getEvaluacionId()).orElseThrow(() -> new NotFoundException("No encontrado"));
        ensureTrimestreActivo(e);
        validateNota(dto.getNotaNumerica());

        var existing = repo.findByEvaluacionIdAndMatriculaId(dto.getEvaluacionId(), dto.getMatriculaId());
        if(existing.isPresent()){
            var entity = existing.get();
            mapper.update(entity, new ResultadoEvaluacionUpdateDTO(dto.getNotaNumerica(), dto.getNotaConceptual(), dto.getObservaciones()));
            return repo.save(entity).getId();
        }

        // validación: matrícula debe estar en la sección de la evaluación en esa fecha
        List<MatriculaSeccionHistorial> h = histRepo.findVigente(dto.getMatriculaId(), e.getFecha());
        boolean ok = h.stream().anyMatch(x -> Objects.equals(x.getSeccion().getId(), e.getSeccionMateria().getSeccion().getId()));
        if(!ok) throw new IllegalArgumentException("La matrícula no estaba en la sección de la evaluación en esa fecha");
        return repo.save(mapper.toEntity(dto)).getId();
    }

    @Transactional
    public void update(Long id, ResultadoEvaluacionUpdateDTO dto){
        var entity = repo.findById(id).orElseThrow(() -> new NotFoundException("No encontrado"));
        ensureTrimestreActivo(entity.getEvaluacion());
        validateNota(dto.getNotaNumerica());
        mapper.update(entity, dto);
        repo.save(entity);
    }

    @Transactional
    public void delete(Long id){
        if(!repo.existsById(id)) throw new NotFoundException("No encontrado");
        repo.deleteById(id);
    }

    private void validateNota(Double nota){
        if(nota == null) return;
        if(nota < 1 || nota > 10) throw new IllegalArgumentException("La nota debe estar entre 1 y 10");
    }

    private void ensureTrimestreActivo(Evaluacion evaluacion) {
        if(evaluacion == null) return;
        var trimestre = evaluacion.getTrimestre();
        if(trimestre != null && trimestre.getEstado() != TrimestreEstado.ACTIVO) {
            throw new IllegalArgumentException("El trimestre no está activo");
        }
    }
}
