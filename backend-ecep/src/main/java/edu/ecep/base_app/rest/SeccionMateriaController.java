package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.*;
import edu.ecep.base_app.service.SeccionMateriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/secciones-materias")
@RequiredArgsConstructor
@Validated
public class SeccionMateriaController {
    private final SeccionMateriaService service;
    @GetMapping public List<SeccionMateriaDTO> list(){ return service.findAll(); }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid SeccionMateriaCreateDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
}