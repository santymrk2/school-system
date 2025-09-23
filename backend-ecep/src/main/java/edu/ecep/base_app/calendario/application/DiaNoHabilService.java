package edu.ecep.base_app.calendario.application;

import edu.ecep.base_app.calendario.domain.DiaNoHabil;
import edu.ecep.base_app.calendario.presentation.dto.DiaNoHabilDTO;
import edu.ecep.base_app.calendario.infrastructure.mapper.DiaNoHabilMapper;
import edu.ecep.base_app.calendario.infrastructure.persistence.DiaNoHabilRepository;
import edu.ecep.base_app.shared.exception.NotFoundException;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service
public class DiaNoHabilService {
    private final DiaNoHabilRepository repository;
    private final DiaNoHabilMapper mapper;

    public DiaNoHabilService(DiaNoHabilRepository repository, DiaNoHabilMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public List<DiaNoHabilDTO> findAll() {
        return repository.findAll(Sort.by("id")).stream().map(mapper::toDto).toList();
    }

    public DiaNoHabilDTO get(Long id) {
        return repository.findById(id).map(mapper::toDto).orElseThrow(NotFoundException::new);
    }

    public Long create(DiaNoHabilDTO dto) {
        return repository.save(mapper.toEntity(dto)).getId();
    }

    public void update(Long id, DiaNoHabilDTO dto) {
        DiaNoHabil entity = repository.findById(id).orElseThrow(NotFoundException::new);
        mapper.update(entity, dto);   // <-- antes: updateEntityFromDto(dto, entity)
        repository.save(entity);
    }


    public void delete(Long id) {
        repository.deleteById(id);
    }
}
