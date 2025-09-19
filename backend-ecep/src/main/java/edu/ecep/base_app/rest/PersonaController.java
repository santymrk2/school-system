package edu.ecep.base_app.rest;

import edu.ecep.base_app.domain.Persona;
import edu.ecep.base_app.dtos.PersonaCreateDTO;
import edu.ecep.base_app.dtos.PersonaDTO;
import edu.ecep.base_app.dtos.PersonaUpdateDTO;
import edu.ecep.base_app.mappers.PersonaMapper;
import edu.ecep.base_app.repos.AlumnoRepository;
import edu.ecep.base_app.repos.AspiranteRepository;
import edu.ecep.base_app.repos.EmpleadoRepository;
import edu.ecep.base_app.repos.FamiliarRepository;
import edu.ecep.base_app.repos.PersonaRepository;
import edu.ecep.base_app.util.NotFoundException;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashSet;

@RestController
@RequestMapping("/api/personas")
@RequiredArgsConstructor
@Validated
public class PersonaController {

    private final PersonaRepository personaRepository;
    private final AlumnoRepository alumnoRepository;
    private final EmpleadoRepository empleadoRepository;
    private final FamiliarRepository familiarRepository;
    private final AspiranteRepository aspiranteRepository;
    private final PersonaMapper personaMapper;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/{personaId}")
    public ResponseEntity<PersonaDTO> get(@PathVariable Long personaId) {
        Persona p = personaRepository.findById(personaId)
                .orElseThrow(() -> new NotFoundException("Persona no encontrada"));
        return ResponseEntity.ok(personaMapper.toDto(p));
    }

    @GetMapping("/dni/{dni}")
    public ResponseEntity<Long> findIdByDni(
            @PathVariable
            @Pattern(regexp = "\\d{7,10}", message = "El DNI debe tener entre 7 y 10 dígitos numéricos")
            String dni) {
        Long id = personaRepository.findByDni(dni)
                .map(Persona::getId)
                .orElseThrow(() -> new NotFoundException("Persona no encontrada por DNI"));
        return ResponseEntity.ok(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTOR','SECRETARY','COORDINATOR')")
    public ResponseEntity<Long> create(@RequestBody @Validated PersonaCreateDTO dto) {
        if (personaRepository.existsByDni(dto.getDni())) {
            throw new IllegalArgumentException("Ya existe una persona con ese DNI");
        }
        if (dto.getEmail() != null && personaRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Ya existe una persona con ese email");
        }
        Persona entity = personaMapper.toEntity(dto);
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            entity.setPassword(passwordEncoder.encode(dto.getPassword()));
        } else {
            entity.setPassword(null);
        }
        if (dto.getRoles() != null && !dto.getRoles().isEmpty()) {
            entity.setRoles(new HashSet<>(dto.getRoles()));
        } else {
            entity.setRoles(new HashSet<>());
        }
        Persona saved = personaRepository.save(entity);
        return new ResponseEntity<>(saved.getId(), HttpStatus.CREATED);
    }

    @PutMapping("/{personaId}")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTOR','SECRETARY','COORDINATOR')")
    public ResponseEntity<Void> update(@PathVariable Long personaId,
                                       @RequestBody @Validated PersonaUpdateDTO dto) {
        Persona entity = personaRepository.findById(personaId)
                .orElseThrow(() -> new NotFoundException("Persona no encontrada"));

        if (dto.getDni() != null && !dto.getDni().equals(entity.getDni())
                && personaRepository.existsByDni(dto.getDni())) {
            throw new IllegalArgumentException("Ya existe una persona con ese DNI");
        }
        if (dto.getEmail() != null && !dto.getEmail().equals(entity.getEmail())
                && personaRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Ya existe una persona con ese email");
        }

        String originalPassword = entity.getPassword();

        personaMapper.update(entity, dto);

        if (dto.getPassword() != null) {
            if (!dto.getPassword().isBlank()) {
                entity.setPassword(passwordEncoder.encode(dto.getPassword()));
            } else {
                entity.setPassword(originalPassword);
            }
        }
        if (dto.getRoles() != null) {
            entity.setRoles(new HashSet<>(dto.getRoles()));
        } else if (entity.getRoles() == null) {
            entity.setRoles(new HashSet<>());
        }

        personaRepository.save(entity);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{personaId}/roles")
    public ResponseEntity<RolesPersonaDTO> roles(@PathVariable Long personaId) {
        // 404 si la persona no existe
        personaRepository.findById(personaId)
                .orElseThrow(() -> new NotFoundException("Persona no encontrada"));

        RolesPersonaDTO dto = new RolesPersonaDTO(
                alumnoRepository.existsByPersonaId(personaId),
                empleadoRepository.existsByPersonaId(personaId),
                familiarRepository.existsByPersonaId(personaId),
                aspiranteRepository.existsByPersonaId(personaId)
        );
        return ResponseEntity.ok(dto);
    }

    public record RolesPersonaDTO(
            boolean esAlumno,
            boolean esEmpleado,
            boolean esFamiliar,
            boolean esAspirante
    ) {}
}
