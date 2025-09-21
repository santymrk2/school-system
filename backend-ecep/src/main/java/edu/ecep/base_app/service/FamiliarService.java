package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.Familiar;
import edu.ecep.base_app.domain.Persona;
import edu.ecep.base_app.dtos.FamiliarDTO;
import edu.ecep.base_app.mappers.FamiliarMapper;
import edu.ecep.base_app.repos.AlumnoFamiliarRepository;
import edu.ecep.base_app.repos.AspiranteFamiliarRepository;
import edu.ecep.base_app.repos.FamiliarRepository;
import edu.ecep.base_app.repos.PersonaRepository;
import edu.ecep.base_app.util.NotFoundException;
import java.util.List;

import edu.ecep.base_app.util.ReferencedException;
import edu.ecep.base_app.util.ReferencedWarning;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service
public class FamiliarService {
    private final FamiliarRepository familiarRepository;

    private final AlumnoFamiliarRepository alumnoFamiliarRepository;
    private final AspiranteFamiliarRepository aspiranteFamiliarRepository;
    private final PersonaRepository personaRepository;
    private final FamiliarMapper mapper;

    public FamiliarService(
            FamiliarRepository familiarRepository,
            AlumnoFamiliarRepository alumnoFamiliarRepository,
            AspiranteFamiliarRepository aspiranteFamiliarRepository,
            PersonaRepository personaRepository,
            FamiliarMapper mapper
    ) {
        this.familiarRepository = familiarRepository;
        this.alumnoFamiliarRepository = alumnoFamiliarRepository;
        this.aspiranteFamiliarRepository = aspiranteFamiliarRepository;
        this.personaRepository = personaRepository;
        this.mapper = mapper;
    }

    public List<FamiliarDTO> findAll() {
        return familiarRepository.findAll(Sort.by("id")).stream().map(mapper::toDto).toList();
    }

    public FamiliarDTO get(Long id) {
        return familiarRepository.findById(id).map(mapper::toDto).orElseThrow(NotFoundException::new);
    }

    @Transactional
    public Long create(FamiliarDTO dto) {
        if (dto.getPersonaId() == null) {
            throw new IllegalArgumentException("Debe enviar personaId");
        }

        Persona persona = personaRepository.findById(dto.getPersonaId())
                .orElseThrow(() -> new NotFoundException("Persona no encontrada"));

        if (familiarRepository.existsByPersonaId(persona.getId())) {
            throw new IllegalArgumentException("La persona ya tiene rol Familiar");
        }

        Familiar entity = mapper.toEntity(dto);
        entity.setPersona(persona); // dejar que @MapsId copie el id de Persona

        Familiar saved = familiarRepository.save(entity);
        Long familiarId = saved.getId();
        return familiarId != null ? familiarId : persona.getId();
    }

    public void update(Long id, FamiliarDTO dto) {
        Familiar entity = familiarRepository.findById(id).orElseThrow(NotFoundException::new);
        if (dto.getPersonaId() != null) {
            Long currentPersonaId = entity.getPersona() != null ? entity.getPersona().getId() : null;
            if (!dto.getPersonaId().equals(currentPersonaId)) {
                throw new IllegalArgumentException(
                        "No se puede cambiar la persona de un Familiar. Elimine y cree uno nuevo con el personaId correcto."
                );
            }
        }

        mapper.update(entity, dto);
        familiarRepository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        ReferencedWarning warning = getReferencedWarning(id);
        if (warning != null) throw new ReferencedException(warning);
        if (!familiarRepository.existsById(id)) throw new NotFoundException("Familiar no encontrado: " + id);
        familiarRepository.deleteById(id);
    }

    public ReferencedWarning getReferencedWarning(Long id) {
        if (alumnoFamiliarRepository.existsByFamiliarId(id)) {
            ReferencedWarning w = new ReferencedWarning("familiar.referenciado.alumnoFamiliar");
            w.addParam(id);
            return w;
        }
        if (aspiranteFamiliarRepository.existsByFamiliarId(id)) {
            ReferencedWarning w = new ReferencedWarning("familiar.referenciado.aspiranteFamiliar");
            w.addParam(id);
            return w;
        }
        return null;
    }
}
