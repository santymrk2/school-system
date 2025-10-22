package edu.ecep.base_app.gestionacademica.presentation.rest;

import edu.ecep.base_app.gestionacademica.application.InformeInicialService;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;



import edu.ecep.base_app.gestionacademica.presentation.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;

@RestController
@RequestMapping("/api/informes-inicial")
@RequiredArgsConstructor
@Validated
public class InformeInicialController {
    private final InformeInicialService service;
    @GetMapping public List<InformeInicialDTO> list(){ return service.findAll(); }
    @GetMapping("/{id}") public InformeInicialDTO get(@PathVariable Long id){ return service.get(id); }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid InformeInicialCreateDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
    @PutMapping("/{id}") public ResponseEntity<Void> update(@PathVariable Long id, @RequestBody @Valid InformeInicialUpdateDTO dto){ service.update(id, dto); return ResponseEntity.noContent().build(); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){ service.delete(id); return ResponseEntity.noContent().build(); }
}
