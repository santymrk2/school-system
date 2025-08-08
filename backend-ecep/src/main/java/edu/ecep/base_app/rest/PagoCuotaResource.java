package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.PagoCuotaDTO;
import edu.ecep.base_app.service.PagoCuotaService;
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
@RequestMapping(value = "/api/pagos-cuota", produces = MediaType.APPLICATION_JSON_VALUE)
public class PagoCuotaResource {

    private final PagoCuotaService pagoCuotaService;

    public PagoCuotaResource(final PagoCuotaService pagoCuotaService) {
        this.pagoCuotaService = pagoCuotaService;
    }

    @GetMapping
    public ResponseEntity<List<PagoCuotaDTO>> getAllPagoCuotas() {
        return ResponseEntity.ok(pagoCuotaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PagoCuotaDTO> getPagoCuota(@PathVariable(name = "id") final Long id) {
        return ResponseEntity.ok(pagoCuotaService.get(id));
    }

    @PostMapping
    @ApiResponse(responseCode = "201")
    public ResponseEntity<Long> createPagoCuota(
            @RequestBody @Valid final PagoCuotaDTO pagoCuotaDTO) {
        final Long createdId = pagoCuotaService.create(pagoCuotaDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Long> updatePagoCuota(@PathVariable(name = "id") final Long id,
            @RequestBody @Valid final PagoCuotaDTO pagoCuotaDTO) {
        pagoCuotaService.update(id, pagoCuotaDTO);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    @ApiResponse(responseCode = "204")
    public ResponseEntity<Void> deletePagoCuota(@PathVariable(name = "id") final Long id) {
        pagoCuotaService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
