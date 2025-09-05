package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.Licencia;
import edu.ecep.base_app.dtos.LicenciaDTO;
import edu.ecep.base_app.mappers.LicenciaMapper;
import edu.ecep.base_app.repos.LicenciaRepository;
import edu.ecep.base_app.util.NotFoundException;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import edu.ecep.base_app.dtos.LicenciaCreateDTO;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LicenciaService {

    private final LicenciaRepository repository;
    private final LicenciaMapper mapper;

    public List<LicenciaDTO> findAll() {
        return repository.findAll(Sort.by("id"))
                .stream().map(mapper::toDto).toList();
    }

    public LicenciaDTO get(Long id) {
        return repository.findById(id)
                .map(mapper::toDto)
                .orElseThrow(NotFoundException::new);
    }

    // <- create con CreateDTO
    public Long create(LicenciaCreateDTO dto) {
        Licencia entity = mapper.toEntity(dto);
        return repository.save(entity).getId();
    }

    // <- update con DTO de lectura (o podrías tener un UpdateDTO si querés)
    public void update(Long id, LicenciaDTO dto) {
        Licencia entity = repository.findById(id)
                .orElseThrow(NotFoundException::new);
        mapper.update(entity, dto); // usa @MappingTarget en el mapper
        repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
