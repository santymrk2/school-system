package edu.ecep.base_app.gestionacademica.presentation.rest;

import edu.ecep.base_app.gestionacademica.presentation.dto.*;
import edu.ecep.base_app.gestionacademica.application.TrimestreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;



import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trimestres")
@RequiredArgsConstructor
public class TrimestreController {

    private final TrimestreService service;

    @GetMapping
    public List<TrimestreDTO> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    public TrimestreDTO get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    public Long create(@Valid @RequestBody TrimestreCreateDTO dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public void update(@PathVariable Long id,
                       @Valid @RequestBody TrimestreDTO dto) {
        service.update(id, dto);
    }

    @PostMapping("/{id}/cerrar")
    public void cerrar(@PathVariable Long id) {
        service.cerrar(id);
    }

    @PostMapping("/{id}/reabrir")
    public void reabrir(@PathVariable Long id) {
        service.reabrir(id);
    }
}
