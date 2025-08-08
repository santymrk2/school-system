package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.AlumnoFamiliar;
import edu.ecep.base_app.mappers.AlumnoFamiliarMapper;
import edu.ecep.base_app.dtos.AlumnoFamiliarDTO;
import edu.ecep.base_app.repos.AlumnoFamiliarRepository;
import edu.ecep.base_app.util.NotFoundException;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service
public class AlumnoFamiliarService {

    private final AlumnoFamiliarRepository repository;
    private final AlumnoFamiliarMapper mapper;

    public AlumnoFamiliarService(AlumnoFamiliarRepository repository,
                                 AlumnoFamiliarMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public List<AlumnoFamiliarDTO> findAll() {
        return repository.findAll(Sort.by("id")).stream()
                .map(mapper::toDto)
                .toList();
    }

    public AlumnoFamiliarDTO get(Long id) {
        return repository.findById(id)
                .map(mapper::toDto)
                .orElseThrow(NotFoundException::new);
    }

    public Long create(AlumnoFamiliarDTO dto) {
        return repository.save(mapper.toEntity(dto)).getId();
    }

    public void update(Long id, AlumnoFamiliarDTO dto) {
        AlumnoFamiliar existing = repository.findById(id)
                .orElseThrow(NotFoundException::new);
        mapper.updateEntityFromDto(dto, existing);
        repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
