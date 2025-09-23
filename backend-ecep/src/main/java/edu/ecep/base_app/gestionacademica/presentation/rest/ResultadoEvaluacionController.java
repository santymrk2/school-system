package edu.ecep.base_app.gestionacademica.presentation.rest;


import edu.ecep.base_app.gestionacademica.presentation.dto.*;
import edu.ecep.base_app.gestionacademica.application.ResultadoEvaluacionService;
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
    @GetMapping("/evaluacion/{evaluacionId}")
    public List<ResultadoEvaluacionDTO> byEvaluacion(@PathVariable Long evaluacionId) {
        return service.findByEvaluacion(evaluacionId);
    }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid ResultadoEvaluacionCreateDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable Long id, @RequestBody @Valid ResultadoEvaluacionUpdateDTO dto){
        service.update(id, dto);
        return ResponseEntity.noContent().build();
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id){
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
