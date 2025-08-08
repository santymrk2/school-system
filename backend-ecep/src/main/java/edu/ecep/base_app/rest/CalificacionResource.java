package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.CalificacionDTO;
import edu.ecep.base_app.service.CalificacionService;
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
@RequestMapping(value = "/api/calificaciones", produces = MediaType.APPLICATION_JSON_VALUE)
public class CalificacionResource {

    private final CalificacionService calificacionService;

    public CalificacionResource(final CalificacionService calificacionService) {
        this.calificacionService = calificacionService;
    }

    @GetMapping
    public ResponseEntity<List<CalificacionDTO>> getAllCalificacions() {
        return ResponseEntity.ok(calificacionService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CalificacionDTO> getCalificacion(
            @PathVariable(name = "id") final Long id) {
        return ResponseEntity.ok(calificacionService.get(id));
    }

    @PostMapping
    @ApiResponse(responseCode = "201")
    public ResponseEntity<Long> createCalificacion(
            @RequestBody @Valid final CalificacionDTO calificacionDTO) {
        final Long createdId = calificacionService.create(calificacionDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Long> updateCalificacion(@PathVariable(name = "id") final Long id,
            @RequestBody @Valid final CalificacionDTO calificacionDTO) {
        calificacionService.update(id, calificacionDTO);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    @ApiResponse(responseCode = "204")
    public ResponseEntity<Void> deleteCalificacion(@PathVariable(name = "id") final Long id) {
        calificacionService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
