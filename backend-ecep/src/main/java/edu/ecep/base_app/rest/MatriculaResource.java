package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.MatriculaDTO;
import edu.ecep.base_app.service.MatriculaService;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping(value = "/api/matriculas", produces = MediaType.APPLICATION_JSON_VALUE)
public class MatriculaResource {

    private final MatriculaService matriculaService;

    public MatriculaResource(final MatriculaService matriculaService) {
        this.matriculaService = matriculaService;
    }

    @GetMapping
    public ResponseEntity<List<MatriculaDTO>> getAllMatriculas() {
        return ResponseEntity.ok(matriculaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MatriculaDTO> getMatricula(@PathVariable(name = "id") final Long id) {
        return ResponseEntity.ok(matriculaService.get(id));
    }

    @PostMapping
    @ApiResponse(responseCode = "201")
    public ResponseEntity<Long> createMatricula(@RequestBody @Valid final MatriculaDTO matriculaDTO) {
        final Long createdId = matriculaService.create(matriculaDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Long> updateMatricula(@PathVariable(name = "id") final Long id,
            @RequestBody @Valid final MatriculaDTO matriculaDTO) {
        matriculaService.update(id, matriculaDTO);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    @ApiResponse(responseCode = "204")
    public ResponseEntity<Void> deleteMatricula(@PathVariable(name = "id") final Long id) {
        matriculaService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
