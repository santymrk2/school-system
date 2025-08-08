package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.EvaluacionDTO;
import edu.ecep.base_app.service.EvaluacionService;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping(value = "/api/evaluaciones", produces = MediaType.APPLICATION_JSON_VALUE)
public class EvaluacionResource {

    private final EvaluacionService evaluacionService;

    public EvaluacionResource(final EvaluacionService evaluacionService) {
        this.evaluacionService = evaluacionService;
    }

    @GetMapping
    public ResponseEntity<List<EvaluacionDTO>> getAllEvaluacions() {
        return ResponseEntity.ok(evaluacionService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EvaluacionDTO> getEvaluacion(@PathVariable(name = "id") final Long id) {
        return ResponseEntity.ok(evaluacionService.get(id));
    }

    @PostMapping
    @ApiResponse(responseCode = "201")
    public ResponseEntity<Long> createEvaluacion(
            @RequestBody @Valid final EvaluacionDTO evaluacionDTO) {
        final Long createdId = evaluacionService.create(evaluacionDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Long> updateEvaluacion(@PathVariable(name = "id") final Long id,
            @RequestBody @Valid final EvaluacionDTO evaluacionDTO) {
        evaluacionService.update(id, evaluacionDTO);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    @ApiResponse(responseCode = "204")
    public ResponseEntity<Void> deleteEvaluacion(@PathVariable(name = "id") final Long id) {
        evaluacionService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
