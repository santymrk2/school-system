package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.ActaAccidenteDTO;
import edu.ecep.base_app.service.ActaAccidenteService;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping(value = "/api/actas-accidente", produces = MediaType.APPLICATION_JSON_VALUE)
public class ActaAccidenteResource {

    private final ActaAccidenteService actaAccidenteService;

    public ActaAccidenteResource(final ActaAccidenteService actaAccidenteService) {
        this.actaAccidenteService = actaAccidenteService;
    }

    @GetMapping
    public ResponseEntity<List<ActaAccidenteDTO>> getAllActaAccidentes() {
        return ResponseEntity.ok(actaAccidenteService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActaAccidenteDTO> getActaAccidente(
            @PathVariable(name = "id") final Long id) {
        return ResponseEntity.ok(actaAccidenteService.get(id));
    }

    @PostMapping
    @ApiResponse(responseCode = "201")
    public ResponseEntity<Long> createActaAccidente(
            @RequestBody @Valid final ActaAccidenteDTO actaAccidenteDTO) {
        final Long createdId = actaAccidenteService.create(actaAccidenteDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Long> updateActaAccidente(@PathVariable(name = "id") final Long id,
            @RequestBody @Valid final ActaAccidenteDTO actaAccidenteDTO) {
        actaAccidenteService.update(id, actaAccidenteDTO);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    @ApiResponse(responseCode = "204")
    public ResponseEntity<Void> deleteActaAccidente(@PathVariable(name = "id") final Long id) {
        actaAccidenteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
