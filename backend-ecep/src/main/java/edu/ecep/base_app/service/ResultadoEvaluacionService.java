package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.Evaluacion;
import edu.ecep.base_app.domain.MatriculaSeccionHistorial;
import edu.ecep.base_app.dtos.ResultadoEvaluacionCreateDTO;
import edu.ecep.base_app.dtos.ResultadoEvaluacionDTO;
import edu.ecep.base_app.mappers.ResultadoEvaluacionMapper;
import edu.ecep.base_app.repos.EvaluacionRepository;
import edu.ecep.base_app.repos.MatriculaSeccionHistorialRepository;
import edu.ecep.base_app.repos.ResultadoEvaluacionRepository;
import edu.ecep.base_app.util.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service @RequiredArgsConstructor
public class ResultadoEvaluacionService {
    private final ResultadoEvaluacionRepository repo; private final ResultadoEvaluacionMapper mapper; private final EvaluacionRepository evalRepo; private final MatriculaSeccionHistorialRepository histRepo;
    public List<ResultadoEvaluacionDTO> findAll(){ return repo.findAll().stream().map(mapper::toDto).toList(); }
    public Long create(ResultadoEvaluacionCreateDTO dto){
        Evaluacion e = evalRepo.findById(dto.getEvaluacionId()).orElseThrow(() -> new NotFoundException("No encontrado"));
        // validación: matrícula debe estar en la sección de la evaluación en esa fecha
        List<MatriculaSeccionHistorial> h = histRepo.findVigente(dto.getMatriculaId(), e.getFecha());
        boolean ok = h.stream().anyMatch(x -> Objects.equals(x.getSeccion().getId(), e.getSeccionMateria().getSeccion().getId()));
        if(!ok) throw new IllegalArgumentException("La matrícula no estaba en la sección de la evaluación en esa fecha");
        if(repo.existsByEvaluacionIdAndMatriculaId(dto.getEvaluacionId(), dto.getMatriculaId())) throw new IllegalArgumentException("Resultado duplicado");
        return repo.save(mapper.toEntity(dto)).getId();
    }
}
