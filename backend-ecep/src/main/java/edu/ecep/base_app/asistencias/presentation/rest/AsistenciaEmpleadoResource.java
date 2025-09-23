package edu.ecep.base_app.asistencias.presentation.rest;

import edu.ecep.base_app.asistencias.presentation.dto.AsistenciaEmpleadoDTO;
import edu.ecep.base_app.asistencias.application.AsistenciaEmpleadoService;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping(value = "/api/asistencia-empleados", produces = MediaType.APPLICATION_JSON_VALUE)
public class AsistenciaEmpleadoResource {

    private final AsistenciaEmpleadoService asistenciaEmpleadoService;

    public AsistenciaEmpleadoResource(final AsistenciaEmpleadoService asistenciaEmpleadoService) {
        this.asistenciaEmpleadoService = asistenciaEmpleadoService;
    }

    @GetMapping
    public ResponseEntity<List<AsistenciaEmpleadoDTO>> getAllAsistenciaEmpleados() {
        return ResponseEntity.ok(asistenciaEmpleadoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AsistenciaEmpleadoDTO> getAsistenciaEmpleado(
            @PathVariable(name = "id") final Long id) {
        return ResponseEntity.ok(asistenciaEmpleadoService.get(id));
    }

    @PostMapping
    @ApiResponse(responseCode = "201")
    public ResponseEntity<Long> createAsistenciaEmpleado(
            @RequestBody @Valid final AsistenciaEmpleadoDTO asistenciaEmpleadoDTO) {
        final Long createdId = asistenciaEmpleadoService.create(asistenciaEmpleadoDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Long> updateAsistenciaEmpleado(@PathVariable(name = "id") final Long id,
                                                    @RequestBody @Valid final AsistenciaEmpleadoDTO asistenciaEmpleadoDTO) {
        asistenciaEmpleadoService.update(id, asistenciaEmpleadoDTO);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    @ApiResponse(responseCode = "204")
    public ResponseEntity<Void> deleteAsistenciaEmpleado(@PathVariable(name = "id") final Long id) {
        asistenciaEmpleadoService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
