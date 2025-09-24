package edu.ecep.base_app.identidad.application;

import edu.ecep.base_app.identidad.domain.Familiar;
import edu.ecep.base_app.identidad.domain.Persona;
import edu.ecep.base_app.identidad.domain.enums.UserRole;
import edu.ecep.base_app.identidad.presentation.dto.FamiliarDTO;
import edu.ecep.base_app.identidad.infrastructure.mapper.FamiliarMapper;
import edu.ecep.base_app.identidad.infrastructure.persistence.AlumnoFamiliarRepository;
import edu.ecep.base_app.admisiones.infrastructure.persistence.AspiranteFamiliarRepository;
import edu.ecep.base_app.identidad.infrastructure.persistence.FamiliarRepository;
import edu.ecep.base_app.identidad.infrastructure.persistence.PersonaRepository;
import edu.ecep.base_app.shared.exception.NotFoundException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import edu.ecep.base_app.shared.exception.ReferencedException;
import edu.ecep.base_app.shared.exception.ReferencedWarning;
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

        ensurePersonaHasRole(persona, UserRole.FAMILY);
        personaRepository.save(persona);

        Familiar saved = familiarRepository.save(entity);
        Long familiarId = saved.getId();
        return familiarId != null ? familiarId : persona.getId();
    }

    @Transactional
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
        if (entity.getPersona() != null) {
            ensurePersonaHasRole(entity.getPersona(), UserRole.FAMILY);
            personaRepository.save(entity.getPersona());
        }
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

    private void ensurePersonaHasRole(Persona persona, UserRole role) {
        if (persona == null) {
            return;
        }
        Set<UserRole> roles = persona.getRoles();
        if (roles == null) {
            roles = new HashSet<>();
            persona.setRoles(roles);
        }
        if (!roles.contains(role)) {
            roles.add(role);
        }
    }
}
