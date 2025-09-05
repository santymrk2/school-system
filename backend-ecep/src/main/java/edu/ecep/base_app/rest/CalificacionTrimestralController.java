package edu.ecep.base_app.rest;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import edu.ecep.base_app.dtos.*;
import edu.ecep.base_app.service.CalificacionTrimestralService;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;

@RestController @RequestMapping("/api/calificaciones-trimestrales")
@RequiredArgsConstructor @Validated
public class CalificacionTrimestralController {
    private final CalificacionTrimestralService service;
    @GetMapping public List<CalificacionTrimestralDTO> list(){ return service.findAll(); }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid CalificacionTrimestralCreateDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
}
