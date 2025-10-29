package edu.ecep.base_app.comunicacion.presentation.rest;

import edu.ecep.base_app.comunicacion.application.ComunicadoService;
import edu.ecep.base_app.comunicacion.presentation.dto.ComunicadoCreateDTO;
import edu.ecep.base_app.comunicacion.presentation.dto.ComunicadoDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comunicados")
@RequiredArgsConstructor
@Validated
public class ComunicadoController {
    private final ComunicadoService service;

    @GetMapping
    public List<ComunicadoDTO> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ComunicadoDTO get(@PathVariable String id) {
        return service.get(id);
    }

    @PostMapping
    public ResponseEntity<String> create(@RequestBody @Valid ComunicadoCreateDTO dto) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable String id, @RequestBody @Valid ComunicadoDTO dto) {
        service.update(id, dto);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
