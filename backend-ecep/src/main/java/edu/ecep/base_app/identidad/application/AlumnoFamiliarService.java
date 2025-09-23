package edu.ecep.base_app.identidad.application;

import edu.ecep.base_app.identidad.domain.AlumnoFamiliar;
import edu.ecep.base_app.identidad.presentation.dto.AlumnoFamiliarCreateDTO;
import edu.ecep.base_app.identidad.presentation.dto.AlumnoFamiliarDTO;
import edu.ecep.base_app.identidad.infrastructure.mapper.AlumnoFamiliarMapper;
import edu.ecep.base_app.identidad.infrastructure.persistence.AlumnoFamiliarRepository;
import edu.ecep.base_app.shared.exception.NotFoundException;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class AlumnoFamiliarService {

    private final AlumnoFamiliarRepository repository;
    private final AlumnoFamiliarMapper mapper;

    public AlumnoFamiliarService(AlumnoFamiliarRepository repository, AlumnoFamiliarMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public List<AlumnoFamiliarDTO> findAll() {
        return repository.findAll(Sort.by("id")).stream().map(mapper::toDto).toList();
    }

    public AlumnoFamiliarDTO get(Long id) {
        return repository.findById(id).map(mapper::toDto).orElseThrow(NotFoundException::new);
    }

    public Long create(AlumnoFamiliarCreateDTO dto) {
        if (repository.existsByAlumnoIdAndFamiliarId(dto.getAlumnoId(), dto.getFamiliarId())) {
            throw new IllegalArgumentException("El vínculo Alumno–Familiar ya existe.");
        }
        return repository.save(mapper.toEntity(dto)).getId();
    }

    public void update(Long id, AlumnoFamiliarDTO dto) {
        AlumnoFamiliar existing = repository.findById(id).orElseThrow(NotFoundException::new);
        // tambien se podria validar duplicados al cambiar ids:
        // if (dto.getAlumnoId()!=null && dto.getFamiliarId()!=null &&
        //     repository.existsByAlumnoIdAndFamiliarId(dto.getAlumnoId(), dto.getFamiliarId())) { ... }
        mapper.update(existing, dto);
        repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
