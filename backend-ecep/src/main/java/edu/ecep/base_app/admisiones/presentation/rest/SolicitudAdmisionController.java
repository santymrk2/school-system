package edu.ecep.base_app.admisiones.presentation.rest;

import edu.ecep.base_app.admisiones.presentation.dto.*;
import edu.ecep.base_app.admisiones.application.SolicitudAdmisionService;
import jakarta.validation.Valid;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/solicitudes-admision")
@RequiredArgsConstructor
@Validated
public class SolicitudAdmisionController {
    private final SolicitudAdmisionService service;
    @GetMapping public List<SolicitudAdmisionDTO> list(){ return service.findAll(); }
    @GetMapping("/{id}") public SolicitudAdmisionDTO get(@PathVariable Long id){ return service.get(id); }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid SolicitudAdmisionDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
    @PutMapping("/{id}") public ResponseEntity<Void> update(@PathVariable Long id, @RequestBody @Valid SolicitudAdmisionDTO dto){ service.update(id, dto); return ResponseEntity.noContent().build(); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){ service.delete(id); return ResponseEntity.noContent().build(); }

    @PostMapping("/{id}/rechazar")
    public ResponseEntity<Void> rechazar(@PathVariable Long id, @RequestBody @Valid SolicitudAdmisionRechazoDTO dto) {
        service.rechazar(id, dto, false);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/programar")
    public ResponseEntity<Void> programar(@PathVariable Long id, @RequestBody @Valid SolicitudAdmisionProgramarDTO dto) {
        service.programar(id, dto);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/confirmar-fecha")
    public ResponseEntity<Void> confirmar(@PathVariable Long id, @RequestBody @Valid SolicitudAdmisionSeleccionDTO dto) {
        service.confirmarFecha(id, dto);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/entrevista")
    public ResponseEntity<Void> registrarEntrevista(@PathVariable Long id, @RequestBody @Valid SolicitudAdmisionEntrevistaDTO dto) {
        service.registrarEntrevista(id, dto);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/decision")
    public ResponseEntity<Void> decidir(@PathVariable Long id, @RequestBody @Valid SolicitudAdmisionDecisionDTO dto) {
        service.decidir(id, dto);
        return ResponseEntity.noContent().build();
    }
}
