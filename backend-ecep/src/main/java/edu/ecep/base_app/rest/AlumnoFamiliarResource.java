package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.AlumnoFamiliarDTO;
import edu.ecep.base_app.service.AlumnoFamiliarService;
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
@RequestMapping(value = "/api/alumno-familiar", produces = MediaType.APPLICATION_JSON_VALUE)
public class AlumnoFamiliarResource {

    private final AlumnoFamiliarService alumnoFamiliarService;

    public AlumnoFamiliarResource(final AlumnoFamiliarService alumnoFamiliarService) {
        this.alumnoFamiliarService = alumnoFamiliarService;
    }

    @GetMapping
    public ResponseEntity<List<AlumnoFamiliarDTO>> getAllAlumnoFamiliars() {
        return ResponseEntity.ok(alumnoFamiliarService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlumnoFamiliarDTO> getAlumnoFamiliar(
            @PathVariable(name = "id") final Long id) {
        return ResponseEntity.ok(alumnoFamiliarService.get(id));
    }

    @PostMapping
    @ApiResponse(responseCode = "201")
    public ResponseEntity<Long> createAlumnoFamiliar(
            @RequestBody @Valid final AlumnoFamiliarDTO alumnoFamiliarDTO) {
        final Long createdId = alumnoFamiliarService.create(alumnoFamiliarDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Long> updateAlumnoFamiliar(@PathVariable(name = "id") final Long id,
            @RequestBody @Valid final AlumnoFamiliarDTO alumnoFamiliarDTO) {
        alumnoFamiliarService.update(id, alumnoFamiliarDTO);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    @ApiResponse(responseCode = "204")
    public ResponseEntity<Void> deleteAlumnoFamiliar(@PathVariable(name = "id") final Long id) {
        alumnoFamiliarService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
