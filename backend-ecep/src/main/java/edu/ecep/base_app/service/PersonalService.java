package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.*;
import edu.ecep.base_app.mappers.PersonalMapper;
import edu.ecep.base_app.dtos.PersonalDTO;
import edu.ecep.base_app.repos.*;
import edu.ecep.base_app.util.NotFoundException;
import java.util.List;

import edu.ecep.base_app.util.ReferencedException;
import edu.ecep.base_app.util.ReferencedWarning;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service
public class PersonalService {
    private final PersonalRepository repository;
    private final AsignacionDocenteRepository asignacionDocenteRepository;
    private final PersonalRepository personalRepository;
    private final ReciboSueldoRepository reciboSueldoRepository;
    private final LicenciaRepository licenciaRepository;
    private final AsistenciaPersonalRepository asistenciaPersonalRepository;
    private final PersonalMapper mapper;

    public PersonalService(
            PersonalRepository repository,
            AsignacionDocenteRepository asignacionDocenteRepository,
            PersonalRepository personalRepository,
            ReciboSueldoRepository reciboSueldoRepository,
            LicenciaRepository licenciaRepository,
            AsistenciaPersonalRepository asistenciaPersonalRepository,
            PersonalMapper mapper
    ) {
        this.repository = repository;
        this.asignacionDocenteRepository = asignacionDocenteRepository;
        this.personalRepository = personalRepository;
        this.reciboSueldoRepository = reciboSueldoRepository;
        this.licenciaRepository = licenciaRepository;
        this.asistenciaPersonalRepository = asistenciaPersonalRepository;
        this.mapper = mapper;
    }

    public List<PersonalDTO> findAll() {
        return repository.findAll(Sort.by("id")).stream().map(mapper::toDto).toList();
    }

    public PersonalDTO get(Long id) {
        return repository.findById(id).map(mapper::toDto).orElseThrow(NotFoundException::new);
    }

    public Long create(PersonalDTO dto) {
        return repository.save(mapper.toEntity(dto)).getId();
    }

    public void update(Long id, PersonalDTO dto) {
        Personal entity = repository.findById(id).orElseThrow(NotFoundException::new);
        mapper.updateEntityFromDto(dto, entity);
        repository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        ReferencedWarning warning = getReferencedWarning(id);
        if (warning != null) throw new ReferencedException(warning);
        if (!personalRepository.existsById(id)) throw new NotFoundException("Personal no encontrado: " + id);
        personalRepository.deleteById(id);
    }

    public ReferencedWarning getReferencedWarning(Long id) {
        if (asignacionDocenteRepository.existsByDocenteId(id)) {
            ReferencedWarning w = new ReferencedWarning("personal.referenciado.asignaciones");
            w.addParam(id);
            return w;
        }
        if (licenciaRepository.existsByPersonalId(id)) {
            ReferencedWarning w = new ReferencedWarning("personal.referenciado.licencias");
            w.addParam(id);
            return w;
        }
        if (reciboSueldoRepository.existsByPersonalId(id)) {
            ReferencedWarning w = new ReferencedWarning("personal.referenciado.recibosSueldo");
            w.addParam(id);
            return w;
        }
        if (asistenciaPersonalRepository.existsByPersonalId(id)) {
            ReferencedWarning w = new ReferencedWarning("personal.referenciado.asistencias");
            w.addParam(id);
            return w;
        }
        return null;
    }
}

