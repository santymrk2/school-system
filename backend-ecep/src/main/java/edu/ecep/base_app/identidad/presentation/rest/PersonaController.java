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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
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
import java.util.Set;
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
        boolean hasManagementPrivileges = hasManagementPrivileges();
        if (hasManagementPrivileges && dto.getPassword() != null && !dto.getPassword().isBlank()) {
            entity.setPassword(passwordEncoder.encode(dto.getPassword()));
        } else {
            entity.setPassword(null);
        }
        if (hasManagementPrivileges && dto.getRoles() != null && !dto.getRoles().isEmpty()) {
            entity.setRoles(new HashSet<>(dto.getRoles()));
        } else {
            entity.setRoles(new HashSet<>());
        }
        Persona saved = personaRepository.save(entity);
        return new ResponseEntity<>(saved.getId(), HttpStatus.CREATED);
    }

    @PutMapping("/{personaId}")
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

        boolean hasManagementPrivileges = hasManagementPrivileges();

        if (!hasManagementPrivileges) {
            ensurePersonaIsPublic(entity);
            applyPublicUpdate(entity, dto);
        } else {
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
        }

        personaRepository.save(entity);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{personaId}/credenciales")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTOR','SECRETARY','COORDINATOR')")
    public ResponseEntity<Void> disableCredentials(@PathVariable Long personaId) {
        Persona entity = personaRepository.findById(personaId)
                .orElseThrow(() -> new NotFoundException("Persona no encontrada"));

        entity.setPassword(null);
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

    private boolean hasManagementPrivileges() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(ROLE_MANAGEMENT::contains);
    }

    private void ensurePersonaIsPublic(Persona persona) {
        boolean hasPassword = persona.getPassword() != null && !persona.getPassword().isBlank();
        boolean hasRoles = persona.getRoles() != null && !persona.getRoles().isEmpty();
        if (hasPassword || hasRoles) {
            throw new AccessDeniedException("No tiene permisos para modificar esta persona");
        }
    }

    private void applyPublicUpdate(Persona entity, PersonaUpdateDTO dto) {
        if (dto.getNombre() != null) {
            entity.setNombre(dto.getNombre());
        }
        if (dto.getApellido() != null) {
            entity.setApellido(dto.getApellido());
        }
        if (dto.getDni() != null) {
            entity.setDni(dto.getDni());
        }
        if (dto.getFechaNacimiento() != null) {
            entity.setFechaNacimiento(dto.getFechaNacimiento());
        }
        if (dto.getGenero() != null) {
            entity.setGenero(dto.getGenero());
        }
        if (dto.getEstadoCivil() != null) {
            entity.setEstadoCivil(dto.getEstadoCivil());
        }
        if (dto.getNacionalidad() != null) {
            entity.setNacionalidad(dto.getNacionalidad());
        }
        if (dto.getDomicilio() != null) {
            entity.setDomicilio(dto.getDomicilio());
        }
        if (dto.getTelefono() != null) {
            entity.setTelefono(dto.getTelefono());
        }
        if (dto.getCelular() != null) {
            entity.setCelular(dto.getCelular());
        }
        if (dto.getEmail() != null) {
            entity.setEmail(dto.getEmail());
        }
        if (dto.getFotoPerfilUrl() != null) {
            String trimmedPhotoUrl = dto.getFotoPerfilUrl().trim();
            entity.setFotoPerfilUrl(trimmedPhotoUrl.isEmpty() ? null : trimmedPhotoUrl);
        }
    }

    private static final Set<String> ROLE_MANAGEMENT = Set.of(
            "ROLE_ADMIN",
            "ROLE_DIRECTOR",
            "ROLE_SECRETARY",
            "ROLE_COORDINATOR"
    );

    public record RolesPersonaDTO(
            boolean esAlumno,
            boolean esEmpleado,
            boolean esFamiliar,
            boolean esAspirante
    ) {}
}
