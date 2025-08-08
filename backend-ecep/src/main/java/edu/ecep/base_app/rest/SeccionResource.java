package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.SeccionDTO;
import edu.ecep.base_app.service.SeccionService;
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
@RequestMapping(value = "/api/secciones", produces = MediaType.APPLICATION_JSON_VALUE)
public class SeccionResource {

    private final SeccionService seccionService;

    public SeccionResource(final SeccionService seccionService) {
        this.seccionService = seccionService;
    }

    @GetMapping
    public ResponseEntity<List<SeccionDTO>> getAllSeccions() {
        return ResponseEntity.ok(seccionService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SeccionDTO> getSeccion(@PathVariable(name = "id") final Long id) {
        return ResponseEntity.ok(seccionService.get(id));
    }

    @PostMapping
    @ApiResponse(responseCode = "201")
    public ResponseEntity<Long> createSeccion(@RequestBody @Valid final SeccionDTO seccionDTO) {
        final Long createdId = seccionService.create(seccionDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Long> updateSeccion(@PathVariable(name = "id") final Long id,
            @RequestBody @Valid final SeccionDTO seccionDTO) {
        seccionService.update(id, seccionDTO);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    @ApiResponse(responseCode = "204")
    public ResponseEntity<Void> deleteSeccion(@PathVariable(name = "id") final Long id) {
        seccionService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
