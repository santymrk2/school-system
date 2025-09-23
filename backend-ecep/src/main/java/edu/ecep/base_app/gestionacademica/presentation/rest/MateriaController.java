package edu.ecep.base_app.gestionacademica.presentation.rest;

import edu.ecep.base_app.gestionacademica.presentation.dto.MateriaCreateDTO;
import edu.ecep.base_app.gestionacademica.presentation.dto.MateriaDTO;
import edu.ecep.base_app.gestionacademica.application.MateriaService;

import java.util.List;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/materias")
@RequiredArgsConstructor @Validated
public class MateriaController {
    private final MateriaService service;
    @GetMapping public List<MateriaDTO> list(){ return service.findAll(); }
    @GetMapping("/{id}") public MateriaDTO get(@PathVariable Long id){ return service.get(id); }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid MateriaCreateDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
    @PutMapping("/{id}") public ResponseEntity<Void> update(@PathVariable Long id, @RequestBody @Valid MateriaCreateDTO dto){ service.update(id, dto); return ResponseEntity.noContent().build(); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){ service.delete(id); return ResponseEntity.noContent().build(); }
}
