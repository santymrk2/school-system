package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.InformeInicialDTO;
import edu.ecep.base_app.service.InformeInicialService;
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
@RequestMapping(value = "/api/informes-inicial", produces = MediaType.APPLICATION_JSON_VALUE)
public class InformeInicialResource {

    private final InformeInicialService informeInicialService;

    public InformeInicialResource(
            final InformeInicialService informeInicialService) {
        this.informeInicialService = informeInicialService;
    }

    @GetMapping
    public ResponseEntity<List<InformeInicialDTO>> getAllInformeTrimestralInicials() {
        return ResponseEntity.ok(informeInicialService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InformeInicialDTO> getInformeTrimestralInicial(
            @PathVariable(name = "id") final Long id) {
        return ResponseEntity.ok(informeInicialService.get(id));
    }

    @PostMapping
    @ApiResponse(responseCode = "201")
    public ResponseEntity<Long> createInformeTrimestralInicial(
            @RequestBody @Valid final InformeInicialDTO informeInicialDTO) {
        final Long createdId = informeInicialService.create(informeInicialDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Long> updateInformeTrimestralInicial(
            @PathVariable(name = "id") final Long id,
            @RequestBody @Valid final InformeInicialDTO informeInicialDTO) {
        informeInicialService.update(id, informeInicialDTO);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    @ApiResponse(responseCode = "204")
    public ResponseEntity<Void> deleteInformeTrimestralInicial(
            @PathVariable(name = "id") final Long id) {
        informeInicialService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
