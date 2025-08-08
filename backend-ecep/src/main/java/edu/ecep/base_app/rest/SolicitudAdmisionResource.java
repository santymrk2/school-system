package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.SolicitudAdmisionDTO;
import edu.ecep.base_app.service.SolicitudAdmisionService;
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
@RequestMapping(value = "/api/solicitudes-admision", produces = MediaType.APPLICATION_JSON_VALUE)
public class SolicitudAdmisionResource {

    private final SolicitudAdmisionService solicitudAdmisionService;

    public SolicitudAdmisionResource(final SolicitudAdmisionService solicitudAdmisionService) {
        this.solicitudAdmisionService = solicitudAdmisionService;
    }

    @GetMapping
    public ResponseEntity<List<SolicitudAdmisionDTO>> getAllSolicitudAdmisions() {
        return ResponseEntity.ok(solicitudAdmisionService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SolicitudAdmisionDTO> getSolicitudAdmision(
            @PathVariable(name = "id") final Long id) {
        return ResponseEntity.ok(solicitudAdmisionService.get(id));
    }

    @PostMapping
    @ApiResponse(responseCode = "201")
    public ResponseEntity<Long> createSolicitudAdmision(
            @RequestBody @Valid final SolicitudAdmisionDTO solicitudAdmisionDTO) {
        final Long createdId = solicitudAdmisionService.create(solicitudAdmisionDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Long> updateSolicitudAdmision(@PathVariable(name = "id") final Long id,
            @RequestBody @Valid final SolicitudAdmisionDTO solicitudAdmisionDTO) {
        solicitudAdmisionService.update(id, solicitudAdmisionDTO);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    @ApiResponse(responseCode = "204")
    public ResponseEntity<Void> deleteSolicitudAdmision(@PathVariable(name = "id") final Long id) {
        solicitudAdmisionService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
