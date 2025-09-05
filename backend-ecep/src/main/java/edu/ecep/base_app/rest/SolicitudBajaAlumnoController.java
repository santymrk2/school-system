package edu.ecep.base_app.rest;


import edu.ecep.base_app.dtos.*;
import edu.ecep.base_app.service.SolicitudBajaAlumnoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/bajas")
@RequiredArgsConstructor @Validated
public class SolicitudBajaAlumnoController {
    private final SolicitudBajaAlumnoService service;
    @GetMapping public List<SolicitudBajaAlumnoDTO> list(){ return service.findAll(); }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid SolicitudBajaAlumnoCreateDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
}