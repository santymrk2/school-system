package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.CuotaDTO;
import edu.ecep.base_app.service.CuotaService;
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
@RequestMapping(value = "/api/cuotas", produces = MediaType.APPLICATION_JSON_VALUE)
public class CuotaResource {

    private final CuotaService cuotaService;

    public CuotaResource(final CuotaService cuotaService) {
        this.cuotaService = cuotaService;
    }

    @GetMapping
    public ResponseEntity<List<CuotaDTO>> getAllCuotas() {
        return ResponseEntity.ok(cuotaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CuotaDTO> getCuota(@PathVariable(name = "id") final Long id) {
        return ResponseEntity.ok(cuotaService.get(id));
    }

    @PostMapping
    @ApiResponse(responseCode = "201")
    public ResponseEntity<Long> createCuota(@RequestBody @Valid final CuotaDTO cuotaDTO) {
        final Long createdId = cuotaService.create(cuotaDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Long> updateCuota(@PathVariable(name = "id") final Long id,
            @RequestBody @Valid final CuotaDTO cuotaDTO) {
        cuotaService.update(id, cuotaDTO);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    @ApiResponse(responseCode = "204")
    public ResponseEntity<Void> deleteCuota(@PathVariable(name = "id") final Long id) {
        cuotaService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
