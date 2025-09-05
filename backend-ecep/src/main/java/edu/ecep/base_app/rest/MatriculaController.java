package edu.ecep.base_app.rest;

import edu.ecep.base_app.service.MatriculaService;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import edu.ecep.base_app.dtos.*;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;

@RestController
@RequestMapping("/api/matriculas")
@RequiredArgsConstructor
@Validated
public class MatriculaController {
    private final MatriculaService service;
    @GetMapping public List<MatriculaDTO> list(){ return service.findAll(); }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid MatriculaCreateDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
}