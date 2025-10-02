package edu.ecep.base_app.vidaescolar.presentation.rest;


import edu.ecep.base_app.vidaescolar.presentation.dto.*;
import edu.ecep.base_app.vidaescolar.application.SolicitudBajaAlumnoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/bajas")
@RequiredArgsConstructor @Validated
public class SolicitudBajaAlumnoController {
    private final SolicitudBajaAlumnoService service;
    @GetMapping public List<SolicitudBajaAlumnoDTO> list(){ return service.findAll(); }
    @GetMapping("/historial") public List<SolicitudBajaAlumnoDTO> historial(){ return service.findHistorial(); }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid SolicitudBajaAlumnoCreateDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
    @PostMapping("/{id}/aprobar") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void aprobar(@PathVariable Long id, @RequestBody @Valid SolicitudBajaAlumnoDecisionDTO dto){ service.aprobar(id, dto); }
    @PostMapping("/{id}/rechazar") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void rechazar(@PathVariable Long id, @RequestBody @Valid SolicitudBajaAlumnoRechazoDTO dto){ service.rechazar(id, dto); }
}