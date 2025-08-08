package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.MateriaDTO;
import edu.ecep.base_app.service.MateriaService;
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
@RequestMapping(value = "/api/materias", produces = MediaType.APPLICATION_JSON_VALUE)
public class MateriasResource {

    private final MateriaService materiaService;

    public MateriasResource(final MateriaService materiaService) {
        this.materiaService = materiaService;
    }

    @GetMapping
    public ResponseEntity<List<MateriaDTO>> getAllMateriass() {
        return ResponseEntity.ok(materiaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MateriaDTO> getMaterias(@PathVariable(name = "id") final Long id) {
        return ResponseEntity.ok(materiaService.get(id));
    }

    @PostMapping
    @ApiResponse(responseCode = "201")
    public ResponseEntity<Long> createMaterias(@RequestBody @Valid final MateriaDTO materiasDTO) {
        final Long createdId = materiaService.create(materiasDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Long> updateMaterias(@PathVariable(name = "id") final Long id,
            @RequestBody @Valid final MateriaDTO materiasDTO) {
        materiaService.update(id, materiasDTO);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    @ApiResponse(responseCode = "204")
    public ResponseEntity<Void> deleteMaterias(@PathVariable(name = "id") final Long id) {
        materiaService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
