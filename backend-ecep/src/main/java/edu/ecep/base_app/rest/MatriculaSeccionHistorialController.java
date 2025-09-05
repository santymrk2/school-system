package edu.ecep.base_app.rest;


import edu.ecep.base_app.dtos.*;
import edu.ecep.base_app.service.MatriculaSeccionHistorialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/matriculas/historial")
@RequiredArgsConstructor @Validated
public class MatriculaSeccionHistorialController {
    private final MatriculaSeccionHistorialService service;
    @GetMapping public List<MatriculaSeccionHistorialDTO> list(){ return service.findAll(); }
    @PostMapping public ResponseEntity<Long> asignar(@RequestBody @Valid MatriculaSeccionHistorialCreateDTO dto){ return new ResponseEntity<>(service.asignar(dto), HttpStatus.CREATED); }
}