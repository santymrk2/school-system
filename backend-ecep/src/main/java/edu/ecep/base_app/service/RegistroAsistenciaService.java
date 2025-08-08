package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.RegistroAsistencia;
import edu.ecep.base_app.mappers.RegistroAsistenciaMapper;
import edu.ecep.base_app.dtos.RegistroAsistenciaDTO;
import edu.ecep.base_app.repos.*;
import edu.ecep.base_app.util.NotFoundException;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service
public class RegistroAsistenciaService {
    private final RegistroAsistenciaRepository repository;
    private final RegistroAsistenciaMapper mapper;

    public RegistroAsistenciaService(RegistroAsistenciaRepository repository, RegistroAsistenciaMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public List<RegistroAsistenciaDTO> findAll() {
        return repository.findAll(Sort.by("id")).stream().map(mapper::toDto).toList();
    }

    public RegistroAsistenciaDTO get(Long id) {
        return repository.findById(id).map(mapper::toDto).orElseThrow(NotFoundException::new);
    }

    public Long create(RegistroAsistenciaDTO dto) {
        return repository.save(mapper.toEntity(dto)).getId();
    }

    public void update(Long id, RegistroAsistenciaDTO dto) {
        RegistroAsistencia entity = repository.findById(id).orElseThrow(NotFoundException::new);
        mapper.updateEntityFromDto(dto, entity);
        repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
