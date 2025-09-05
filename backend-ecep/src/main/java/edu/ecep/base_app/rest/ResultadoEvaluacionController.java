package edu.ecep.base_app.rest;


import edu.ecep.base_app.dtos.*;
import edu.ecep.base_app.service.ResultadoEvaluacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/resultados")
@RequiredArgsConstructor @Validated
public class ResultadoEvaluacionController {
    private final ResultadoEvaluacionService service;
    @GetMapping public List<ResultadoEvaluacionDTO> list(){ return service.findAll(); }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid ResultadoEvaluacionCreateDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
}