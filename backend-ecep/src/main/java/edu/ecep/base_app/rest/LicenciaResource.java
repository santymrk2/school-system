package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.LicenciaDTO;
import edu.ecep.base_app.service.LicenciaService;
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
@RequestMapping(value = "/api/licencias", produces = MediaType.APPLICATION_JSON_VALUE)
public class LicenciaResource {

    private final LicenciaService licenciaService;

    public LicenciaResource(final LicenciaService licenciaService) {
        this.licenciaService = licenciaService;
    }

    @GetMapping
    public ResponseEntity<List<LicenciaDTO>> getAllLicencias() {
        return ResponseEntity.ok(licenciaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LicenciaDTO> getLicencia(@PathVariable(name = "id") final Long id) {
        return ResponseEntity.ok(licenciaService.get(id));
    }

    @PostMapping
    @ApiResponse(responseCode = "201")
    public ResponseEntity<Long> createLicencia(@RequestBody @Valid final LicenciaDTO licenciaDTO) {
        final Long createdId = licenciaService.create(licenciaDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Long> updateLicencia(@PathVariable(name = "id") final Long id,
            @RequestBody @Valid final LicenciaDTO licenciaDTO) {
        licenciaService.update(id, licenciaDTO);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    @ApiResponse(responseCode = "204")
    public ResponseEntity<Void> deleteLicencia(@PathVariable(name = "id") final Long id) {
        licenciaService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
