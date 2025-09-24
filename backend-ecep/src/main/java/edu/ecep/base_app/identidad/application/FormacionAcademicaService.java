package edu.ecep.base_app.identidad.application;

import edu.ecep.base_app.identidad.domain.FormacionAcademica;
import edu.ecep.base_app.identidad.domain.Empleado;
import edu.ecep.base_app.identidad.presentation.dto.FormacionAcademicaDTO;
import edu.ecep.base_app.identidad.infrastructure.mapper.FormacionAcademicaMapper;
import edu.ecep.base_app.identidad.infrastructure.persistence.FormacionAcademicaRepository;
import edu.ecep.base_app.identidad.infrastructure.persistence.EmpleadoRepository;
import edu.ecep.base_app.shared.exception.NotFoundException;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service
public class FormacionAcademicaService {
    private final FormacionAcademicaRepository repository;
    private final FormacionAcademicaMapper mapper;
    private final EmpleadoRepository empleadoRepository;

    public FormacionAcademicaService(
            FormacionAcademicaRepository repository,
            FormacionAcademicaMapper mapper,
            EmpleadoRepository empleadoRepository) {
        this.repository = repository;
        this.mapper = mapper;
        this.empleadoRepository = empleadoRepository;
    }

    public List<FormacionAcademicaDTO> findAll() {
        return repository.findAll(Sort.by("id")).stream().map(mapper::toDto).toList();
    }

    public FormacionAcademicaDTO get(Long id) {
        return repository.findById(id).map(mapper::toDto).orElseThrow(NotFoundException::new);
    }

    public Long create(FormacionAcademicaDTO dto) {
        FormacionAcademica entity = mapper.toEntity(dto);
        Empleado empleado = empleadoRepository.findById(dto.getEmpleadoId()).orElseThrow(NotFoundException::new);
        entity.setEmpleado(empleado);
        return repository.save(entity).getId();
    }

    public void update(Long id, FormacionAcademicaDTO dto) {
        FormacionAcademica entity = repository.findById(id).orElseThrow(NotFoundException::new);
        mapper.updateEntityFromDto(dto, entity);
        if (dto.getEmpleadoId() != null &&
                (entity.getEmpleado() == null || !dto.getEmpleadoId().equals(entity.getEmpleado().getId()))) {
            Empleado empleado = empleadoRepository.findById(dto.getEmpleadoId()).orElseThrow(NotFoundException::new);
            entity.setEmpleado(empleado);
        }
        repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
