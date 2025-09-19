package edu.ecep.base_app.rest;

import edu.ecep.base_app.domain.Persona;
import edu.ecep.base_app.dtos.PersonaResumenDTO;
import edu.ecep.base_app.service.PersonaAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/personas/credenciales")
@RequiredArgsConstructor
public class PersonaAccountController {

    private final PersonaAccountService personaAccountService;

    @GetMapping("/{personaId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PersonaResumenDTO> getById(@PathVariable Long personaId) {
        return ResponseEntity.ok(personaAccountService.getResumen(personaId));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTOR','SECRETARY','COORDINATOR')")
    public ResponseEntity<List<PersonaResumenDTO>> search(@RequestParam(required = false) String q) {
        Persona current = null;
        try {
            current = personaAccountService.getCurrentPersona();
        } catch (Exception ignored) {
        }
        Long excludeId = current != null ? current.getId() : null;
        return ResponseEntity.ok(personaAccountService.search(q, excludeId));
    }
}
