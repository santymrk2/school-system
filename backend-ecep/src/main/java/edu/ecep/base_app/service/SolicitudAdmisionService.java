package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.SolicitudAdmision;
import edu.ecep.base_app.mappers.SolicitudAdmisionMapper;
import edu.ecep.base_app.repos.SolicitudAdmisionRepository;
import edu.ecep.base_app.dtos.SolicitudAdmisionDTO;

import edu.ecep.base_app.util.NotFoundException;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service
public class SolicitudAdmisionService {
    private final SolicitudAdmisionRepository repository;
    private final SolicitudAdmisionMapper mapper;

    public SolicitudAdmisionService(SolicitudAdmisionRepository repository, SolicitudAdmisionMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public List<SolicitudAdmisionDTO> findAll() {
        return repository.findAll(Sort.by("id")).stream().map(mapper::toDto).toList();
    }

    public SolicitudAdmisionDTO get(Long id) {
        return repository.findById(id).map(mapper::toDto).orElseThrow(NotFoundException::new);
    }

    public Long create(SolicitudAdmisionDTO dto) {
        return repository.save(mapper.toEntity(dto)).getId();
    }

    public void update(Long id, SolicitudAdmisionDTO dto) {
        SolicitudAdmision entity = repository.findById(id).orElseThrow(NotFoundException::new);
        mapper.updateEntityFromDto(dto, entity);
        repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
