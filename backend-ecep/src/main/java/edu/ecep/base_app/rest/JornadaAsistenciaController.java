package edu.ecep.base_app.rest;
import edu.ecep.base_app.service.JornadaAsistenciaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;


import edu.ecep.base_app.dtos.JornadaAsistenciaCreateDTO;
import edu.ecep.base_app.dtos.JornadaAsistenciaDTO;
import java.util.List;

@RestController
@RequestMapping("/api/asistencias/jornadas")
@RequiredArgsConstructor
@Validated
public class JornadaAsistenciaController {

    private final JornadaAsistenciaService service;

    // Listado simple
    @GetMapping
    public List<JornadaAsistenciaDTO> list() {
        return service.findAll();
    }

    // Búsqueda por sección + rango de fechas
    @GetMapping(params = {"seccionId","from","to"})
    public List<JornadaAsistenciaDTO> porSeccionYRango(
            @RequestParam Long seccionId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return service.findBySeccionBetween(seccionId, from, to);
    }

    @GetMapping(params = {"seccionId","fecha"})
    public ResponseEntity<JornadaAsistenciaDTO> bySeccionFecha(
            @RequestParam Long seccionId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return service.findBySeccionAndFecha(seccionId, fecha)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }


    // Búsqueda por sección
    @GetMapping(params = "seccionId")
    public List<JornadaAsistenciaDTO> porSeccion(@RequestParam Long seccionId) {
        return service.findBySeccion(seccionId);
    }

    // Búsqueda por trimestre
    @GetMapping(params = "trimestreId")
    public List<JornadaAsistenciaDTO> porTrimestre(@RequestParam Long trimestreId) {
        return service.findByTrimestre(trimestreId);
    }

    // Abrir jornada
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTOR','TEACHER')")
    @PostMapping
    public ResponseEntity<Long> abrir(@RequestBody @Valid JornadaAsistenciaCreateDTO dto) {
        return new ResponseEntity<>(service.abrir(dto), HttpStatus.CREATED);
    }


    @GetMapping("/{id}")
    public JornadaAsistenciaDTO get(@PathVariable Long id) {
        return service.get(id);
    }
}
