package edu.ecep.base_app.rest;


import edu.ecep.base_app.domain.DetalleAsistencia;
import edu.ecep.base_app.domain.JornadaAsistencia;
import edu.ecep.base_app.domain.Matricula;
import edu.ecep.base_app.dtos.*;
import edu.ecep.base_app.repos.DetalleAsistenciaRepository;
import edu.ecep.base_app.service.DetalleAsistenciaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

import java.util.List;

@RestController
@RequestMapping("/api/asistencias/detalles")
@RequiredArgsConstructor
@Validated
public class DetalleAsistenciaController {

    private final DetalleAsistenciaService service;

    @GetMapping
    public List<DetalleAsistenciaDTO> list() {
        return service.findAll();
    }

    @PostMapping
    public ResponseEntity<Long> marcar(@RequestBody @Validated DetalleAsistenciaCreateDTO dto) {
        return new ResponseEntity<>(service.marcar(dto), HttpStatus.CREATED);
    }

    @GetMapping("/search")
    @Transactional(readOnly = true)
    public List<DetalleAsistenciaDTO> search(
            @RequestParam(required = false) Long jornadaId,
            @RequestParam(required = false) Long matriculaId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return service.search(jornadaId, matriculaId, from, to);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTOR','TEACHER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build(); // 204
    }
}
