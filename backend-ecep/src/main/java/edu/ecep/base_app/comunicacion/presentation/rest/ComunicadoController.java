package edu.ecep.base_app.comunicacion.presentation.rest;

import edu.ecep.base_app.comunicacion.application.ComunicadoService;
import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import edu.ecep.base_app.comunicacion.presentation.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;

@RestController
@RequestMapping("/api/comunicados")
@RequiredArgsConstructor
@Validated
public class ComunicadoController{
    private final ComunicadoService service;
    @GetMapping public List<ComunicadoDTO> list(){ return service.findAll(); }
    @GetMapping("/{id}") public ComunicadoDTO get(@PathVariable Long id){ return service.get(id); }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid ComunicadoCreateDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
    @PutMapping("/{id}") public ResponseEntity<Void> update(@PathVariable Long id, @RequestBody @Valid ComunicadoDTO dto){ service.update(id, dto); return ResponseEntity.noContent().build(); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){ service.delete(id); return ResponseEntity.noContent().build(); }
}
