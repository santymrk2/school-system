package edu.ecep.base_app.rest;


import edu.ecep.base_app.dtos.*;
import edu.ecep.base_app.service.MatriculaSeccionHistorialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController @RequestMapping("/api/matriculas/historial")
@RequiredArgsConstructor @Validated
public class MatriculaSeccionHistorialController {
    private final MatriculaSeccionHistorialService service;
    @GetMapping public List<MatriculaSeccionHistorialDTO> list(){ return service.findAll(); }
    @PostMapping public ResponseEntity<Long> asignar(@RequestBody @Valid MatriculaSeccionHistorialCreateDTO dto){ return new ResponseEntity<>(service.asignar(dto), HttpStatus.CREATED); }
    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable Long id,
                                       @RequestBody @Valid MatriculaSeccionHistorialDTO dto) {
        service.update(id, dto);
        return ResponseEntity.noContent().build();
    }
}