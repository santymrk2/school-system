package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.ComunicadoDTO;
import edu.ecep.base_app.service.ComunicadoService;
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
@RequestMapping(value = "/api/comunicados", produces = MediaType.APPLICATION_JSON_VALUE)
public class ComunicadoResource {

    private final ComunicadoService comunicadoService;

    public ComunicadoResource(final ComunicadoService comunicadoService) {
        this.comunicadoService = comunicadoService;
    }

    @GetMapping
    public ResponseEntity<List<ComunicadoDTO>> getAllComunicados() {
        return ResponseEntity.ok(comunicadoService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComunicadoDTO> getComunicado(@PathVariable(name = "id") final Long id) {
        return ResponseEntity.ok(comunicadoService.get(id));
    }

    @PostMapping
    @ApiResponse(responseCode = "201")
    public ResponseEntity<Long> createComunicado(
            @RequestBody @Valid final ComunicadoDTO comunicadoDTO) {
        final Long createdId = comunicadoService.create(comunicadoDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Long> updateComunicado(@PathVariable(name = "id") final Long id,
            @RequestBody @Valid final ComunicadoDTO comunicadoDTO) {
        comunicadoService.update(id, comunicadoDTO);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    @ApiResponse(responseCode = "204")
    public ResponseEntity<Void> deleteComunicado(@PathVariable(name = "id") final Long id) {
        comunicadoService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
