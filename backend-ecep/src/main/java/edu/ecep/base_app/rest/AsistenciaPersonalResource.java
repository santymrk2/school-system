package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.AsistenciaPersonalDTO;
import edu.ecep.base_app.service.AsistenciaPersonalService;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping(value = "/api/asistencia-personal", produces = MediaType.APPLICATION_JSON_VALUE)
public class AsistenciaPersonalResource {

    private final AsistenciaPersonalService asistenciaPersonalService;

    public AsistenciaPersonalResource(final AsistenciaPersonalService asistenciaPersonalService) {
        this.asistenciaPersonalService = asistenciaPersonalService;
    }

    @GetMapping
    public ResponseEntity<List<AsistenciaPersonalDTO>> getAllAsistenciaPersonals() {
        return ResponseEntity.ok(asistenciaPersonalService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AsistenciaPersonalDTO> getAsistenciaPersonal(
            @PathVariable(name = "id") final Long id) {
        return ResponseEntity.ok(asistenciaPersonalService.get(id));
    }

    @PostMapping
    @ApiResponse(responseCode = "201")
    public ResponseEntity<Long> createAsistenciaPersonal(
            @RequestBody @Valid final AsistenciaPersonalDTO asistenciaPersonalDTO) {
        final Long createdId = asistenciaPersonalService.create(asistenciaPersonalDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Long> updateAsistenciaPersonal(@PathVariable(name = "id") final Long id,
                                                    @RequestBody @Valid final AsistenciaPersonalDTO asistenciaPersonalDTO) {
        asistenciaPersonalService.update(id, asistenciaPersonalDTO);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    @ApiResponse(responseCode = "204")
    public ResponseEntity<Void> deleteAsistenciaPersonal(@PathVariable(name = "id") final Long id) {
        asistenciaPersonalService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
