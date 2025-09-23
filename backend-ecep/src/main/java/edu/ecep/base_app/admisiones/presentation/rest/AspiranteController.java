package edu.ecep.base_app.admisiones.presentation.rest;

import edu.ecep.base_app.admisiones.presentation.dto.AspiranteDTO;
import edu.ecep.base_app.admisiones.application.AspiranteService;
import jakarta.validation.Valid;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController @RequestMapping("/api/aspirantes")
@RequiredArgsConstructor @Validated
public class AspiranteController {
    private final AspiranteService service;
    @GetMapping public List<AspiranteDTO> list(){ return service.findAll(); }
    @GetMapping("/{id}") public AspiranteDTO get(@PathVariable Long id){ return service.get(id); }
    @PostMapping public ResponseEntity<AspiranteDTO> create(@RequestBody @Valid AspiranteDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
    @PutMapping("/{id}") public ResponseEntity<Void> update(@PathVariable Long id, @RequestBody @Valid AspiranteDTO dto){ service.update(id, dto); return ResponseEntity.noContent().build(); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){ service.delete(id); return ResponseEntity.noContent().build(); }
}