package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.InformeInicial;
import edu.ecep.base_app.mappers.InformeInicialMapper;
import edu.ecep.base_app.dtos.InformeInicialDTO;
import edu.ecep.base_app.repos.*;
import edu.ecep.base_app.util.NotFoundException;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service
public class InformeInicialService {
    private final InformeInicialRepository repository;
    private final InformeInicialMapper mapper;

    public InformeInicialService(InformeInicialRepository repository, InformeInicialMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public List<InformeInicialDTO> findAll() {
        return repository.findAll(Sort.by("id")).stream().map(mapper::toDto).toList();
    }

    public InformeInicialDTO get(Long id) {
        return repository.findById(id).map(mapper::toDto).orElseThrow(NotFoundException::new);
    }

    public Long create(InformeInicialDTO dto) {
        return repository.save(mapper.toEntity(dto)).getId();
    }

    public void update(Long id, InformeInicialDTO dto) {
        InformeInicial entity = repository.findById(id).orElseThrow(NotFoundException::new);
        mapper.updateEntityFromDto(dto, entity);
        repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
