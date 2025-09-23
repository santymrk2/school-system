package edu.ecep.base_app.finanzas.presentation.rest;

import edu.ecep.base_app.finanzas.application.CuotaService;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;



import edu.ecep.base_app.finanzas.presentation.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;

@RestController
@RequestMapping("/api/cuotas")
@RequiredArgsConstructor
@Validated
public class CuotaController {
    private final CuotaService service;
    @GetMapping public List<CuotaDTO> list(){ return service.findAll(); }
    @GetMapping("/{id}") public CuotaDTO get(@PathVariable Long id){ return service.get(id); }
    @PostMapping("/bulk") public ResponseEntity<List<Long>> bulk(@RequestBody @Valid CuotaBulkCreateDTO dto){ return new ResponseEntity<>(service.bulkCreate(dto), HttpStatus.CREATED); }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid CuotaCreateDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
    @PutMapping("/{id}") public ResponseEntity<Void> update(@PathVariable Long id, @RequestBody @Valid CuotaDTO dto){ service.update(id, dto); return ResponseEntity.noContent().build(); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){ service.delete(id); return ResponseEntity.noContent().build(); }
}
