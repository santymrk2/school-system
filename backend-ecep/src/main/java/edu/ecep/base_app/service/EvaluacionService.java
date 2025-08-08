package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.Evaluacion;
import edu.ecep.base_app.mappers.EvaluacionMapper;
import edu.ecep.base_app.dtos.EvaluacionDTO;
import edu.ecep.base_app.repos.EvaluacionRepository;
import edu.ecep.base_app.util.NotFoundException;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class EvaluacionService {
    private final EvaluacionRepository repository;
    private final EvaluacionMapper mapper;

    public EvaluacionService(EvaluacionRepository repository, EvaluacionMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public List<EvaluacionDTO> findAll() {
        return repository.findAll(Sort.by("id")).stream().map(mapper::toDto).toList();
    }

    public EvaluacionDTO get(Long id) {
        return repository.findById(id).map(mapper::toDto).orElseThrow(NotFoundException::new);
    }

    public Long create(EvaluacionDTO dto) {
        return repository.save(mapper.toEntity(dto)).getId();
    }

    public void update(Long id, EvaluacionDTO dto) {
        Evaluacion entity = repository.findById(id).orElseThrow(NotFoundException::new);
        mapper.updateEntityFromDto(dto, entity);
        repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
