package edu.ecep.base_app.vidaescolar.presentation.rest;

import edu.ecep.base_app.vidaescolar.application.MatriculaService;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import edu.ecep.base_app.vidaescolar.presentation.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;

@RestController
@RequestMapping("/api/matriculas")
@RequiredArgsConstructor
@Validated
public class MatriculaController {
    private final MatriculaService service;
    @GetMapping public List<MatriculaDTO> list(){ return service.findAll(); }
    @GetMapping("/{id}") public MatriculaDTO get(@PathVariable Long id){ return service.get(id); }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid MatriculaCreateDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
    @PutMapping("/{id}") public ResponseEntity<Void> update(@PathVariable Long id, @RequestBody @Valid MatriculaDTO dto){ service.update(id, dto); return ResponseEntity.noContent().build(); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){ service.delete(id); return ResponseEntity.noContent().build(); }
}
