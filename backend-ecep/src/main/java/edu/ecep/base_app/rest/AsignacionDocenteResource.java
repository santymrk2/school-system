package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.AsignacionDocenteDTO;
import edu.ecep.base_app.service.AsignacionDocenteService;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/api/asignacion-docente", produces = MediaType.APPLICATION_JSON_VALUE)
public class AsignacionDocenteResource {

    private final AsignacionDocenteService asistenciaDiaService;

    public AsignacionDocenteResource(final AsignacionDocenteService asistenciaDiaService) {
        this.asistenciaDiaService = asistenciaDiaService;
    }

    @GetMapping
    public ResponseEntity<List<AsignacionDocenteDTO>> getAllAsignacionDocentes() {
        return ResponseEntity.ok(asistenciaDiaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AsignacionDocenteDTO> getAsignacionDocente(
            @PathVariable(name = "id") final Long id) {
        return ResponseEntity.ok(asistenciaDiaService.get(id));
    }

    @PostMapping
    @ApiResponse(responseCode = "201")
    public ResponseEntity<Long> createAsignacionDocente(
            @RequestBody @Valid final AsignacionDocenteDTO asistenciaDiaDTO) {
        final Long createdId = asistenciaDiaService.create(asistenciaDiaDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Long> updateAsignacionDocente(@PathVariable(name = "id") final Long id,
                                                    @RequestBody @Valid final AsignacionDocenteDTO asistenciaDiaDTO) {
        asistenciaDiaService.update(id, asistenciaDiaDTO);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    @ApiResponse(responseCode = "204")
    public ResponseEntity<Void> deleteAsignacionDocente(@PathVariable(name = "id") final Long id) {
        asistenciaDiaService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
