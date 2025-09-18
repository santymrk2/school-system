package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.LicenciaCreateDTO;
import edu.ecep.base_app.dtos.LicenciaDTO;
import edu.ecep.base_app.service.LicenciaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@RestController
@RequestMapping("/api/licencias")
@RequiredArgsConstructor
@Validated
public class LicenciaController {
    private final LicenciaService service;
    @GetMapping
    public List<LicenciaDTO> list(@RequestParam(required = false) Long empleadoId){
        return service.findAll(empleadoId);
    }
    @GetMapping("/{id}") public LicenciaDTO get(@PathVariable Long id){ return service.get(id); }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid LicenciaCreateDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
    @PutMapping("/{id}") public ResponseEntity<Void> update(@PathVariable Long id, @RequestBody @Valid LicenciaDTO dto){ service.update(id, dto); return ResponseEntity.noContent().build(); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){ service.delete(id); return ResponseEntity.noContent().build(); }
}
