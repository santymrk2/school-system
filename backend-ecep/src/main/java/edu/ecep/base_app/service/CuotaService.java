package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.Cuota;
import edu.ecep.base_app.mappers.CuotaMapper;
import edu.ecep.base_app.dtos.CuotaDTO;
import edu.ecep.base_app.repos.CuotaRepository;
import edu.ecep.base_app.util.NotFoundException;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service
public class CuotaService {
    private final CuotaRepository repository;
    private final CuotaMapper mapper;

    public CuotaService(CuotaRepository repository, CuotaMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public List<CuotaDTO> findAll() {
        return repository.findAll(Sort.by("id")).stream().map(mapper::toDto).toList();
    }

    public CuotaDTO get(Long id) {
        return repository.findById(id).map(mapper::toDto).orElseThrow(NotFoundException::new);
    }

    public Long create(CuotaDTO dto) {
        return repository.save(mapper.toEntity(dto)).getId();
    }

    public void update(Long id, CuotaDTO dto) {
        Cuota entity = repository.findById(id).orElseThrow(NotFoundException::new);
        mapper.updateEntityFromDto(dto, entity);
        repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
