package edu.ecep.base_app.gestionacademica.presentation.rest;

import edu.ecep.base_app.gestionacademica.presentation.dto.AsignacionDocenteSeccionCreateDTO;
import edu.ecep.base_app.gestionacademica.presentation.dto.AsignacionDocenteSeccionDTO;
import edu.ecep.base_app.gestionacademica.application.AsignacionDocenteSeccionService;
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

    @GetMapping(params = "seccionId")
    public List<AsignacionDocenteSeccionDTO> bySeccion(@RequestParam Long seccionId) {
        return service.findBySeccion(seccionId);
    }

    @PostMapping
    public ResponseEntity<Long> create(@RequestBody @Valid AsignacionDocenteSeccionCreateDTO dto) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/by-docente")
    public List<AsignacionDocenteSeccionDTO> byDocente(@RequestParam Long empleadoId,
                                                       @RequestParam(required = false)
                                                       @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return service.findVigentesByEmpleado(empleadoId, fecha);
    }

}