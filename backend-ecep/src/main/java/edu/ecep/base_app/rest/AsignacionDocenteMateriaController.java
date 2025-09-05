package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.*;
import edu.ecep.base_app.service.AsignacionDocenteMateriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/asignaciones/materia")
@RequiredArgsConstructor @Validated
public class AsignacionDocenteMateriaController {
    private final AsignacionDocenteMateriaService service;
    @GetMapping public List<AsignacionDocenteMateriaDTO> list(){ return service.findAll(); }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid AsignacionDocenteMateriaCreateDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
}