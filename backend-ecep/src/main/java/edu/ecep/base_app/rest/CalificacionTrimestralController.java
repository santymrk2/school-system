package edu.ecep.base_app.rest;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import edu.ecep.base_app.dtos.*;
import edu.ecep.base_app.service.CalificacionTrimestralService;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;

@RestController @RequestMapping("/api/calificaciones-trimestrales")
@RequiredArgsConstructor @Validated
public class CalificacionTrimestralController {
    private final CalificacionTrimestralService service;
    @GetMapping public List<CalificacionTrimestralDTO> list(){ return service.findAll(); }
    @GetMapping("/{id}") public CalificacionTrimestralDTO get(@PathVariable Long id){ return service.get(id); }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid CalificacionTrimestralCreateDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
    @PutMapping("/{id}") public ResponseEntity<Void> update(@PathVariable Long id, @RequestBody @Valid CalificacionTrimestralDTO dto){ service.update(id, dto); return ResponseEntity.noContent().build(); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){ service.delete(id); return ResponseEntity.noContent().build(); }
}
