package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.RegistroAsistenciaDTO;
import edu.ecep.base_app.service.RegistroAsistenciaService;
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
@RequestMapping(value = "/api/registros-asistencia", produces = MediaType.APPLICATION_JSON_VALUE)
public class RegistroAsistenciaResource {

    private final RegistroAsistenciaService registroAsistenciaService;

    public RegistroAsistenciaResource(final RegistroAsistenciaService registroAsistenciaService) {
        this.registroAsistenciaService = registroAsistenciaService;
    }

    @GetMapping
    public ResponseEntity<List<RegistroAsistenciaDTO>> getAllRegistroAsistencias() {
        return ResponseEntity.ok(registroAsistenciaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegistroAsistenciaDTO> getRegistroAsistencia(
            @PathVariable(name = "id") final Long id) {
        return ResponseEntity.ok(registroAsistenciaService.get(id));
    }

    @PostMapping
    @ApiResponse(responseCode = "201")
    public ResponseEntity<Long> createRegistroAsistencia(
            @RequestBody @Valid final RegistroAsistenciaDTO registroAsistenciaDTO) {
        final Long createdId = registroAsistenciaService.create(registroAsistenciaDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Long> updateRegistroAsistencia(@PathVariable(name = "id") final Long id,
            @RequestBody @Valid final RegistroAsistenciaDTO registroAsistenciaDTO) {
        registroAsistenciaService.update(id, registroAsistenciaDTO);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    @ApiResponse(responseCode = "204")
    public ResponseEntity<Void> deleteRegistroAsistencia(@PathVariable(name = "id") final Long id) {
        registroAsistenciaService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
