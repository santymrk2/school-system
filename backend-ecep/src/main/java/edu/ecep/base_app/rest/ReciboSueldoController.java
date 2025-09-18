package edu.ecep.base_app.rest;

import edu.ecep.base_app.service.ReciboSueldoService;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.ecep.base_app.dtos.*;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;


@RestController
@RequestMapping("/api/recibos-sueldo")
@RequiredArgsConstructor
@Validated
public class ReciboSueldoController {
    private final ReciboSueldoService service;
    @GetMapping public List<ReciboSueldoDTO> list(){ return service.findAll(); }
    @GetMapping("/{id}") public ReciboSueldoDTO get(@PathVariable Long id){ return service.get(id); }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid ReciboSueldoCreateDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
    @PutMapping("/{id}") public ResponseEntity<Void> update(@PathVariable Long id, @RequestBody @Valid ReciboSueldoDTO dto){ service.update(id, dto); return ResponseEntity.noContent().build(); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){ service.delete(id); return ResponseEntity.noContent().build(); }
}
