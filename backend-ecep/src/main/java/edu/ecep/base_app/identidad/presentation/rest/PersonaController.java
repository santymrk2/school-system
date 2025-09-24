package edu.ecep.base_app.identidad.presentation.rest;

import edu.ecep.base_app.identidad.application.PersonaPhotoStorageService;
import edu.ecep.base_app.identidad.domain.Persona;
import edu.ecep.base_app.identidad.infrastructure.mapper.PersonaMapper;
import edu.ecep.base_app.identidad.infrastructure.persistence.AlumnoRepository;
import edu.ecep.base_app.admisiones.infrastructure.persistence.AspiranteRepository;
import edu.ecep.base_app.identidad.infrastructure.persistence.EmpleadoRepository;
import edu.ecep.base_app.identidad.infrastructure.persistence.FamiliarRepository;
import edu.ecep.base_app.identidad.infrastructure.persistence.PersonaRepository;
import edu.ecep.base_app.identidad.presentation.dto.FotoPerfilUploadResponse;
import edu.ecep.base_app.identidad.presentation.dto.PersonaCreateDTO;
import edu.ecep.base_app.identidad.presentation.dto.PersonaDTO;
import edu.ecep.base_app.identidad.presentation.dto.PersonaUpdateDTO;
import edu.ecep.base_app.shared.exception.NotFoundException;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

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
    private final PersonaPhotoStorageService personaPhotoStorageService;

    @GetMapping
    public ResponseEntity<List<PersonaDTO>> findAllById(@RequestParam(name = "ids", required = false) List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<PersonaDTO> personas = personaRepository.findAllById(ids).stream()
                .map(personaMapper::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(personas);
    }

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
        if (dto.getFotoPerfilUrl() != null) {
            String trimmedPhotoUrl = dto.getFotoPerfilUrl().trim();
            entity.setFotoPerfilUrl(trimmedPhotoUrl.isEmpty() ? null : trimmedPhotoUrl);
        }
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

        if (dto.getFotoPerfilUrl() != null) {
            String trimmedPhotoUrl = dto.getFotoPerfilUrl().trim();
            entity.setFotoPerfilUrl(trimmedPhotoUrl.isEmpty() ? null : trimmedPhotoUrl);
        }

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

    @PostMapping(value = "/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTOR','SECRETARY','COORDINATOR')")
    public ResponseEntity<FotoPerfilUploadResponse> uploadFotoPerfil(
            @RequestParam("file") MultipartFile file) {
        PersonaPhotoStorageService.StoredPhoto stored = personaPhotoStorageService.store(file);
        String url = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/media/")
                .path(stored.relativePath())
                .toUriString();

        FotoPerfilUploadResponse response = new FotoPerfilUploadResponse(
                url,
                stored.fileName(),
                stored.size()
        );
        return ResponseEntity.ok(response);
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
