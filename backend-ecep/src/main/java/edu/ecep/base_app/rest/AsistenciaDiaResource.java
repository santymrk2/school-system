package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.AsistenciaDiaDTO;
import edu.ecep.base_app.service.AsistenciaDiaService;
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
@RequestMapping(value = "/api/asistencia-dias", produces = MediaType.APPLICATION_JSON_VALUE)
public class AsistenciaDiaResource {

    private final AsistenciaDiaService asistenciaDiaService;

    public AsistenciaDiaResource(final AsistenciaDiaService asistenciaDiaService) {
        this.asistenciaDiaService = asistenciaDiaService;
    }

    @GetMapping
    public ResponseEntity<List<AsistenciaDiaDTO>> getAllAsistenciaDias() {
        return ResponseEntity.ok(asistenciaDiaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AsistenciaDiaDTO> getAsistenciaDia(
            @PathVariable(name = "id") final Long id) {
        return ResponseEntity.ok(asistenciaDiaService.get(id));
    }

    @PostMapping
    @ApiResponse(responseCode = "201")
    public ResponseEntity<Long> createAsistenciaDia(
            @RequestBody @Valid final AsistenciaDiaDTO asistenciaDiaDTO) {
        final Long createdId = asistenciaDiaService.create(asistenciaDiaDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Long> updateAsistenciaDia(@PathVariable(name = "id") final Long id,
            @RequestBody @Valid final AsistenciaDiaDTO asistenciaDiaDTO) {
        asistenciaDiaService.update(id, asistenciaDiaDTO);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    @ApiResponse(responseCode = "204")
    public ResponseEntity<Void> deleteAsistenciaDia(@PathVariable(name = "id") final Long id) {
        asistenciaDiaService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
