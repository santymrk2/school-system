package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.PersonaDTO; // si no tenés, podés devolver un map básico
import edu.ecep.base_app.dtos.PersonaCreateDTO;
import edu.ecep.base_app.dtos.PersonaUpdateDTO;
import edu.ecep.base_app.dtos.PersonaUsuarioLinkDTO;
import edu.ecep.base_app.mappers.PersonaMapper;
import edu.ecep.base_app.repos.*;
import edu.ecep.base_app.domain.Persona;
import edu.ecep.base_app.domain.Usuario;
import edu.ecep.base_app.util.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.constraints.Pattern;

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
    private final UsuarioRepository usuarioRepository;
    private final PersonaMapper personaMapper;

    // PersonaController
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
        Persona entity = personaMapper.toEntity(dto);
        Persona saved = personaRepository.save(entity);
        return new ResponseEntity<>(saved.getId(), HttpStatus.CREATED);
    }

    @PutMapping("/{personaId}")
    public ResponseEntity<Void> update(@PathVariable Long personaId,
                                       @RequestBody @Validated PersonaUpdateDTO dto) {
        Persona entity = personaRepository.findById(personaId)
                .orElseThrow(() -> new NotFoundException("Persona no encontrada"));
        personaMapper.update(entity, dto);
        personaRepository.save(entity);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{personaId}/link-usuario")
    public ResponseEntity<Void> linkUsuario(@PathVariable Long personaId,
                                            @RequestBody @Validated PersonaUsuarioLinkDTO request) {
        Persona persona = personaRepository.findById(personaId)
                .orElseThrow(() -> new NotFoundException("Persona no encontrada"));

        Usuario current = persona.getUsuario();
        if (current != null) {
            if (current.getId().equals(request.usuarioId())) {
                return ResponseEntity.noContent().build();
            }
            throw new IllegalStateException("La persona ya está vinculada a un usuario");
        }

        Usuario usuario = usuarioRepository.findById(request.usuarioId())
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));

        if (usuario.getPersona() != null && !usuario.getPersona().getId().equals(personaId)) {
            throw new IllegalStateException("El usuario ya está vinculado a otra persona");
        }

        persona.setUsuario(usuario);
        usuario.setPersona(persona);
        personaRepository.save(persona);
        usuarioRepository.save(usuario);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{personaId}/unlink-usuario")
    public ResponseEntity<Void> unlinkUsuario(@PathVariable Long personaId) {
        Persona persona = personaRepository.findById(personaId)
                .orElseThrow(() -> new NotFoundException("Persona no encontrada"));

        Usuario usuario = persona.getUsuario();
        if (usuario != null) {
            persona.setUsuario(null);
            personaRepository.save(persona);

            usuario.setPersona(null);
            usuarioRepository.save(usuario);
        }

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{personaId}/roles")
    public ResponseEntity<RolesPersonaDTO> roles(@PathVariable Long personaId) {
        // 404 si la persona no existe
        personaRepository.findById(personaId)
                .orElseThrow(() -> new NotFoundException("Persona no encontrada"));

        RolesPersonaDTO dto = new RolesPersonaDTO(
                alumnoRepository.existsByPersonaId(personaId),     // ya lo tenés en el repo de alumno
                empleadoRepository.existsByPersonaId(personaId),   // ya lo tenés en el repo de empleado  [oai_citation:8‡repo.txt](file-service://file-LASNrXoaoxpsQRihikYxQX)
                familiarRepository.existsByPersonaId(personaId),   // existe en tu repo de familiar  [oai_citation:9‡dtos.txt](file-service://file-2K2ZUDBA9dEooKRDQE77Py)
                aspiranteRepository.existsByPersonaId(personaId)   // existe en tu repo de aspirante  [oai_citation:10‡repo.txt](file-service://file-LASNrXoaoxpsQRihikYxQX)
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
