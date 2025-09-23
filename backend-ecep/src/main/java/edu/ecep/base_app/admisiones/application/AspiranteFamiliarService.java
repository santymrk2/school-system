package edu.ecep.base_app.admisiones.application;

import edu.ecep.base_app.admisiones.domain.AspiranteFamiliar;
import edu.ecep.base_app.admisiones.presentation.dto.AspiranteFamiliarDTO;
import edu.ecep.base_app.admisiones.infrastructure.mapper.AspiranteFamiliarMapper;
import edu.ecep.base_app.admisiones.infrastructure.persistence.AspiranteFamiliarRepository;
import edu.ecep.base_app.shared.exception.NotFoundException;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service
public class AspiranteFamiliarService {
    private final AspiranteFamiliarRepository repository;
    private final AspiranteFamiliarMapper mapper;

    public AspiranteFamiliarService(AspiranteFamiliarRepository repository, AspiranteFamiliarMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public List<AspiranteFamiliarDTO> findAll() {
        return repository.findAll(Sort.by("id")).stream().map(mapper::toDto).toList();
    }

    public AspiranteFamiliarDTO get(Long id) {
        return repository.findById(id).map(mapper::toDto).orElseThrow(NotFoundException::new);
    }

    public Long create(AspiranteFamiliarDTO dto) {
        return repository.save(mapper.toEntity(dto)).getId();
    }

    public void update(Long id, AspiranteFamiliarDTO dto) {
        AspiranteFamiliar entity = repository.findById(id).orElseThrow(NotFoundException::new);
        mapper.updateEntityFromDto(dto, entity);
        repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
