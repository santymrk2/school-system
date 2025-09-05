package edu.ecep.base_app.rest;

import edu.ecep.base_app.service.FormacionAcademicaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import edu.ecep.base_app.dtos.*;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import java.util.List;

@RestController @RequestMapping("/api/formaciones")
@RequiredArgsConstructor @Validated
public class FormacionAcademicaController {
    private final FormacionAcademicaService service;
    @GetMapping
    public List<FormacionAcademicaDTO> list(){ return service.findAll(); }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid FormacionAcademicaDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
    @PutMapping("/{id}") public ResponseEntity<Void> update(@PathVariable Long id, @RequestBody @Valid FormacionAcademicaDTO dto){ service.update(id, dto); return ResponseEntity.noContent().build(); }
}