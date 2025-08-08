package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.PagoCuota;
import edu.ecep.base_app.mappers.PagoCuotaMapper;
import edu.ecep.base_app.dtos.PagoCuotaDTO;
import edu.ecep.base_app.repos.*;
import edu.ecep.base_app.util.NotFoundException;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service
public class PagoCuotaService {
    private final PagoCuotaRepository repository;
    private final PagoCuotaMapper mapper;

    public PagoCuotaService(PagoCuotaRepository repository, PagoCuotaMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public List<PagoCuotaDTO> findAll() {
        return repository.findAll(Sort.by("id")).stream().map(mapper::toDto).toList();
    }

    public PagoCuotaDTO get(Long id) {
        return repository.findById(id).map(mapper::toDto).orElseThrow(NotFoundException::new);
    }

    public Long create(PagoCuotaDTO dto) {
        return repository.save(mapper.toEntity(dto)).getId();
    }

    public void update(Long id, PagoCuotaDTO dto) {
        PagoCuota entity = repository.findById(id).orElseThrow(NotFoundException::new);
        mapper.updateEntityFromDto(dto, entity);
        repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
