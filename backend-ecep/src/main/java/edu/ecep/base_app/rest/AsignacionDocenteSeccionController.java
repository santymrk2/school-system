package edu.ecep.base_app.rest;

import edu.ecep.base_app.domain.AsignacionDocenteSeccion;
import edu.ecep.base_app.dtos.*;
import edu.ecep.base_app.repos.AsignacionDocenteSeccionRepository;
import edu.ecep.base_app.service.AsignacionDocenteSeccionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/asignaciones/seccion")
@RequiredArgsConstructor
@Validated
public class AsignacionDocenteSeccionController {
    private final AsignacionDocenteSeccionService service;
    private final AsignacionDocenteSeccionRepository repo;

    @GetMapping public List<AsignacionDocenteSeccionDTO> list(){ return service.findAll(); }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid AsignacionDocenteSeccionCreateDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
    @GetMapping("/by-docente")
    public List<AsignacionDocenteSeccion> byDocente(@RequestParam Long personalId,
                                                    @RequestParam(required=false)
                                                    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        LocalDate f = fecha != null ? fecha : LocalDate.now();
        return repo.findVigentesByPersonal(personalId, f);
    }

}