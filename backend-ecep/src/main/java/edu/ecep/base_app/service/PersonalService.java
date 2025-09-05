package edu.ecep.base_app.service;

import edu.ecep.base_app.dtos.PersonalDTO;
import edu.ecep.base_app.mappers.PersonalMapper;
import edu.ecep.base_app.repos.*;
import edu.ecep.base_app.util.DuplicateDniException;
import edu.ecep.base_app.util.NotFoundException;
import java.util.List;
import edu.ecep.base_app.util.ReferencedException;
import edu.ecep.base_app.util.ReferencedWarning;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import edu.ecep.base_app.domain.Personal;
import lombok.RequiredArgsConstructor;
import edu.ecep.base_app.dtos.PersonalCreateDTO;
import edu.ecep.base_app.dtos.PersonalUpdateDTO;

@Service
@RequiredArgsConstructor
public class PersonalService {

    private final PersonalRepository repo;
    private final AsignacionDocenteSeccionRepository adsRepo;
    private final AsignacionDocenteMateriaRepository admRepo;
    private final ReciboSueldoRepository reciboRepo;
    private final LicenciaRepository licenciaRepo;
    private final AsistenciaPersonalRepository asistenciaRepo;
    private final PersonalMapper mapper;

    public List<PersonalDTO> findAll() {
        return repo.findAll(Sort.by("id")).stream().map(mapper::toDto).toList();
    }

    public PersonalDTO get(Long id) {
        return repo.findById(id).map(mapper::toDto)
                .orElseThrow(() -> new NotFoundException("No encontrado"));
    }

    public Long create(PersonalCreateDTO dto) {
        if (dto.getDni()!=null && repo.existsByDni(dto.getDni()))
            throw new DuplicateDniException("DNI ya registrado");
        if (dto.getCuil()!=null && repo.existsByCuil(dto.getCuil()))
            throw new IllegalArgumentException("CUIL ya registrado");
        Personal e = mapper.toEntity(dto);
        return repo.save(e).getId();
    }

    public void update(Long id, PersonalUpdateDTO dto) {
        Personal e = repo.findById(id).orElseThrow(() -> new NotFoundException("No encontrado"));
        // Validaciones de unicidad solo si cambia el valor
        if (dto.getDni()!=null && !dto.getDni().equals(e.getDni()) && repo.existsByDni(dto.getDni()))
            throw new DuplicateDniException("DNI ya registrado");
        if (dto.getCuil()!=null && !dto.getCuil().equals(e.getCuil()) && repo.existsByCuil(dto.getCuil()))
            throw new IllegalArgumentException("CUIL ya registrado");

        mapper.update(e, dto);   // <-- ahora compila: existe en el mapper
        repo.save(e);
    }

    @Transactional
    public void delete(Long id) {
        ReferencedWarning w = getReferencedWarning(id);
        if (w != null) throw new ReferencedException(w);
        if (!repo.existsById(id)) throw new NotFoundException("Personal no encontrado: " + id);
        repo.deleteById(id);
    }

    public ReferencedWarning getReferencedWarning(Long id) {
        // Si usás estos métodos, asegurate que existen en los repos:
        if (licenciaRepo.existsByPersonalId(id))
            return new ReferencedWarning("personal.referenciado.licencias");
        if (reciboRepo.existsByPersonalId(id))
            return new ReferencedWarning("personal.referenciado.recibos");
        if (asistenciaRepo.existsByPersonalId(id))
            return new ReferencedWarning("personal.referenciado.asistencia");
        // (Opcional) si querés validar asignaciones:
        // if (adsRepo.existsByPersonalId(id) || admRepo.existsByPersonalId(id)) ...
        return null;
    }
}
