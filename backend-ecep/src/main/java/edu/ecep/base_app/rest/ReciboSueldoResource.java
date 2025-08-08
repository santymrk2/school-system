package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.ReciboSueldoDTO;
import edu.ecep.base_app.service.ReciboSueldoService;
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
@RequestMapping(value = "/api/recibos-sueldo", produces = MediaType.APPLICATION_JSON_VALUE)
public class ReciboSueldoResource {

    private final ReciboSueldoService reciboSueldoService;

    public ReciboSueldoResource(final ReciboSueldoService reciboSueldoService) {
        this.reciboSueldoService = reciboSueldoService;
    }

    @GetMapping
    public ResponseEntity<List<ReciboSueldoDTO>> getAllReciboSueldos() {
        return ResponseEntity.ok(reciboSueldoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReciboSueldoDTO> getReciboSueldo(
            @PathVariable(name = "id") final Long id) {
        return ResponseEntity.ok(reciboSueldoService.get(id));
    }

    @PostMapping
    @ApiResponse(responseCode = "201")
    public ResponseEntity<Long> createReciboSueldo(
            @RequestBody @Valid final ReciboSueldoDTO reciboSueldoDTO) {
        final Long createdId = reciboSueldoService.create(reciboSueldoDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Long> updateReciboSueldo(@PathVariable(name = "id") final Long id,
            @RequestBody @Valid final ReciboSueldoDTO reciboSueldoDTO) {
        reciboSueldoService.update(id, reciboSueldoDTO);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    @ApiResponse(responseCode = "204")
    public ResponseEntity<Void> deleteReciboSueldo(@PathVariable(name = "id") final Long id) {
        reciboSueldoService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
