package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.Licencia;
import edu.ecep.base_app.mappers.LicenciaMapper;
import edu.ecep.base_app.dtos.LicenciaDTO;
import edu.ecep.base_app.repos.LicenciaRepository;
import edu.ecep.base_app.util.NotFoundException;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service
public class LicenciaService {
    private final LicenciaRepository repository;
    private final LicenciaMapper mapper;

    public LicenciaService(LicenciaRepository repository, LicenciaMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public List<LicenciaDTO> findAll() {
        return repository.findAll(Sort.by("id")).stream().map(mapper::toDto).toList();
    }

    public LicenciaDTO get(Long id) {
        return repository.findById(id).map(mapper::toDto).orElseThrow(NotFoundException::new);
    }

    public Long create(LicenciaDTO dto) {
        return repository.save(mapper.toEntity(dto)).getId();
    }

    public void update(Long id, LicenciaDTO dto) {
        Licencia entity = repository.findById(id).orElseThrow(NotFoundException::new);
        mapper.updateEntityFromDto(dto, entity);
        repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
