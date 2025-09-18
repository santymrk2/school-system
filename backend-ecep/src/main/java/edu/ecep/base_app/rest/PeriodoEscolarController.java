package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.*;
import edu.ecep.base_app.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/periodos")
@RequiredArgsConstructor
@Validated
public class PeriodoEscolarController {
    private final PeriodoEscolarService service;

    @GetMapping
    public List<PeriodoEscolarDTO> list() { return service.findAll(); }

    @GetMapping("/{id}")
    public PeriodoEscolarDTO get(@PathVariable Long id) { return service.get(id); }

    @PostMapping
    public ResponseEntity<Long> create(@RequestBody @Valid PeriodoEscolarCreateDTO dto) {
        Long id = service.create(dto);
        return new ResponseEntity<>(id, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/cerrar")
    public ResponseEntity<Void> cerrar(@PathVariable Long id) {
        service.cerrar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/abrir")
    public ResponseEntity<Void> abrir(@PathVariable Long id) {
        service.abrir(id);
        return ResponseEntity.noContent().build();
    }
}