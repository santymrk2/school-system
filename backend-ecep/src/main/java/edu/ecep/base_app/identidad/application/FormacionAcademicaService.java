package edu.ecep.base_app.identidad.application;

import edu.ecep.base_app.identidad.domain.FormacionAcademica;
import edu.ecep.base_app.identidad.presentation.dto.FormacionAcademicaDTO;
import edu.ecep.base_app.identidad.infrastructure.mapper.FormacionAcademicaMapper;
import edu.ecep.base_app.identidad.infrastructure.persistence.FormacionAcademicaRepository;
import edu.ecep.base_app.shared.exception.NotFoundException;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service
public class FormacionAcademicaService {
    private final FormacionAcademicaRepository repository;
    private final FormacionAcademicaMapper mapper;

    public FormacionAcademicaService(FormacionAcademicaRepository repository, FormacionAcademicaMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public List<FormacionAcademicaDTO> findAll() {
        return repository.findAll(Sort.by("id")).stream().map(mapper::toDto).toList();
    }

    public FormacionAcademicaDTO get(Long id) {
        return repository.findById(id).map(mapper::toDto).orElseThrow(NotFoundException::new);
    }

    public Long create(FormacionAcademicaDTO dto) {
        return repository.save(mapper.toEntity(dto)).getId();
    }

    public void update(Long id, FormacionAcademicaDTO dto) {
        FormacionAcademica entity = repository.findById(id).orElseThrow(NotFoundException::new);
        mapper.updateEntityFromDto(dto, entity);
        repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
