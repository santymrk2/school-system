package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.AsignacionDocenteSeccionCreateDTO;
import edu.ecep.base_app.dtos.AsignacionDocenteSeccionDTO;
import edu.ecep.base_app.service.AsignacionDocenteSeccionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/asignaciones/seccion")
@RequiredArgsConstructor
@Validated
public class AsignacionDocenteSeccionController {
    private final AsignacionDocenteSeccionService service;

    @GetMapping
    public List<AsignacionDocenteSeccionDTO> list() {
        return service.findAll();
    }

    @PostMapping
    public ResponseEntity<Long> create(@RequestBody @Valid AsignacionDocenteSeccionCreateDTO dto) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @GetMapping("/by-docente")
    public List<AsignacionDocenteSeccionDTO> byDocente(@RequestParam Long empleadoId,
                                                       @RequestParam(required = false)
                                                       @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return service.findVigentesByEmpleado(empleadoId, fecha);
    }

}