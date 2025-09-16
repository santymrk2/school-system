package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.PersonaDTO; // si no tenés, podés devolver un map básico
import edu.ecep.base_app.repos.*;
import edu.ecep.base_app.domain.Persona;
import edu.ecep.base_app.util.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

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

    // PersonaController
    @GetMapping("/{personaId}")
    public ResponseEntity<PersonaDTO> get(@PathVariable Long personaId) {
        Persona p = personaRepository.findById(personaId)
                .orElseThrow(() -> new NotFoundException("Persona no encontrada"));
        PersonaDTO dto = PersonaDTO.builder()
                .id(p.getId())
                .nombre(p.getNombre())
                .apellido(p.getApellido())
                .dni(p.getDni())
                .fechaNacimiento(p.getFechaNacimiento())
                .genero(p.getGenero())
                .estadoCivil(p.getEstadoCivil())
                .nacionalidad(p.getNacionalidad())
                .domicilio(p.getDomicilio())
                .telefono(p.getTelefono())
                .celular(p.getCelular())
                .email(p.getEmail())
                .build();
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/dni/{dni}")
    public ResponseEntity<Long> findIdByDni(@PathVariable String dni) {
        Long id = personaRepository.findByDni(dni)
                .map(Persona::getId)
                .orElseThrow(() -> new NotFoundException("Persona no encontrada por DNI"));
        return ResponseEntity.ok(id);
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