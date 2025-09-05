package edu.ecep.base_app.rest;

import edu.ecep.base_app.service.EvaluacionService;

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
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;

@RestController @RequestMapping("/api/evaluaciones")
@RequiredArgsConstructor @Validated
public class EvaluacionController {
    private final EvaluacionService service;
    @GetMapping public List<EvaluacionDTO> list(){ return service.findAll(); }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid EvaluacionCreateDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
}
