package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.AlumnoFamiliarCreateDTO;
import edu.ecep.base_app.dtos.AlumnoFamiliarDTO;
import edu.ecep.base_app.service.AlumnoFamiliarService;
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

@RestController
@RequestMapping("/api/alumnos-familiares")
@RequiredArgsConstructor
@Validated
public class AlumnoFamiliarController {

    private final AlumnoFamiliarService service;

    @GetMapping
    public List<AlumnoFamiliarDTO> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public AlumnoFamiliarDTO get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    public ResponseEntity<Long> create(@RequestBody @Valid AlumnoFamiliarCreateDTO dto) {
        Long id = service.create(dto);
        return new ResponseEntity<>(id, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable Long id, @RequestBody @Valid AlumnoFamiliarDTO dto) {
        service.update(id, dto);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}