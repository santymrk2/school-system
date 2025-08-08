package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.ReciboSueldo;
import edu.ecep.base_app.mappers.ReciboSueldoMapper;
import edu.ecep.base_app.dtos.ReciboSueldoDTO;
import edu.ecep.base_app.repos.ReciboSueldoRepository;
import edu.ecep.base_app.util.NotFoundException;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service
public class ReciboSueldoService {
    private final ReciboSueldoRepository repository;
    private final ReciboSueldoMapper mapper;

    public ReciboSueldoService(ReciboSueldoRepository repository, ReciboSueldoMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public List<ReciboSueldoDTO> findAll() {
        return repository.findAll(Sort.by("id")).stream().map(mapper::toDto).toList();
    }

    public ReciboSueldoDTO get(Long id) {
        return repository.findById(id).map(mapper::toDto).orElseThrow(NotFoundException::new);
    }

    public Long create(ReciboSueldoDTO dto) {
        return repository.save(mapper.toEntity(dto)).getId();
    }

    public void update(Long id, ReciboSueldoDTO dto) {
        ReciboSueldo entity = repository.findById(id).orElseThrow(NotFoundException::new);
        mapper.updateEntityFromDto(dto, entity);
        repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
