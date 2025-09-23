package edu.ecep.base_app.gestionacademica.presentation.rest;

import edu.ecep.base_app.gestionacademica.application.EvaluacionService;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import edu.ecep.base_app.gestionacademica.presentation.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;

@RestController @RequestMapping("/api/evaluaciones")
@RequiredArgsConstructor @Validated
public class EvaluacionController {
    private final EvaluacionService service;
    @GetMapping
    public List<EvaluacionDTO> list(
            @RequestParam(required = false) Long seccionId,
            @RequestParam(required = false) Long trimestreId,
            @RequestParam(required = false) Long materiaId) {
        return service.findAll(seccionId, trimestreId, materiaId);
    }
    @GetMapping("/{id}") public EvaluacionDTO get(@PathVariable Long id){ return service.get(id); }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid EvaluacionCreateDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
    @PutMapping("/{id}") public ResponseEntity<Void> update(@PathVariable Long id, @RequestBody @Valid EvaluacionDTO dto){ service.update(id, dto); return ResponseEntity.noContent().build(); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){ service.delete(id); return ResponseEntity.noContent().build(); }
}
