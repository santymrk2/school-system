package edu.ecep.base_app.identidad.application;

import edu.ecep.base_app.identidad.domain.Licencia;
import edu.ecep.base_app.identidad.presentation.dto.LicenciaDTO;
import edu.ecep.base_app.identidad.infrastructure.mapper.LicenciaMapper;
import edu.ecep.base_app.identidad.infrastructure.persistence.LicenciaRepository;
import edu.ecep.base_app.shared.exception.NotFoundException;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import edu.ecep.base_app.identidad.presentation.dto.LicenciaCreateDTO;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LicenciaService {

    private final LicenciaRepository repository;
    private final LicenciaMapper mapper;

    public List<LicenciaDTO> findAll(Long empleadoId) {
        List<Licencia> entities = empleadoId != null
                ? repository.findByEmpleadoId(empleadoId)
                : repository.findAll(Sort.by("fechaInicio").descending());

        Comparator<Licencia> comparator = Comparator
                .comparing(Licencia::getFechaInicio, Comparator.nullsLast(LocalDate::compareTo))
                .thenComparing(Licencia::getId, Comparator.nullsLast(Long::compare))
                .reversed();

        return entities.stream()
                .sorted(comparator)
                .map(mapper::toDto)
                .toList();
    }

    public LicenciaDTO get(Long id) {
        return repository.findById(id)
                .map(mapper::toDto)
                .orElseThrow(NotFoundException::new);
    }

    // <- create con CreateDTO
    public Long create(LicenciaCreateDTO dto) {
        Licencia entity = mapper.toEntity(dto);
        if (entity.getJustificada() == null) {
            entity.setJustificada(Boolean.FALSE);
        }
        return repository.save(entity).getId();
    }

    // <- update con DTO de lectura (o podrías tener un UpdateDTO si querés)
    public void update(Long id, LicenciaDTO dto) {
        Licencia entity = repository.findById(id)
                .orElseThrow(NotFoundException::new);
        mapper.update(entity, dto); // usa @MappingTarget en el mapper
        if (entity.getJustificada() == null) {
            entity.setJustificada(Boolean.FALSE);
        }
        repository.save(entity);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
