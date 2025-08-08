package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.FormacionAcademicaDTO;
import edu.ecep.base_app.service.FormacionAcademicaService;
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
@RequestMapping(value = "/api/formacion-academica", produces = MediaType.APPLICATION_JSON_VALUE)
public class FormacionAcademicaResource {

    private final FormacionAcademicaService formacionAcademicaService;

    public FormacionAcademicaResource(final FormacionAcademicaService formacionAcademicaService) {
        this.formacionAcademicaService = formacionAcademicaService;
    }

    @GetMapping
    public ResponseEntity<List<FormacionAcademicaDTO>> getAllFormacionAcademicas() {
        return ResponseEntity.ok(formacionAcademicaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FormacionAcademicaDTO> getFormacionAcademica(
            @PathVariable(name = "id") final Long id) {
        return ResponseEntity.ok(formacionAcademicaService.get(id));
    }

    @PostMapping
    @ApiResponse(responseCode = "201")
    public ResponseEntity<Long> createFormacionAcademica(
            @RequestBody @Valid final FormacionAcademicaDTO formacionAcademicaDTO) {
        final Long createdId = formacionAcademicaService.create(formacionAcademicaDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Long> updateFormacionAcademica(@PathVariable(name = "id") final Long id,
            @RequestBody @Valid final FormacionAcademicaDTO formacionAcademicaDTO) {
        formacionAcademicaService.update(id, formacionAcademicaDTO);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    @ApiResponse(responseCode = "204")
    public ResponseEntity<Void> deleteFormacionAcademica(@PathVariable(name = "id") final Long id) {
        formacionAcademicaService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
