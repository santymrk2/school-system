package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.DiaNoHabilDTO;
import edu.ecep.base_app.service.DiaNoHabilService;
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
@RequestMapping(value = "/api/no-habiles", produces = MediaType.APPLICATION_JSON_VALUE)
public class DiaNoHabilResource {

    private final DiaNoHabilService diaNoHabilService;

    public DiaNoHabilResource(final DiaNoHabilService diaNoHabilService) {
        this.diaNoHabilService = diaNoHabilService;
    }

    @GetMapping
    public ResponseEntity<List<DiaNoHabilDTO>> getAllDiaNoHabils() {
        return ResponseEntity.ok(diaNoHabilService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiaNoHabilDTO> getDiaNoHabil(@PathVariable(name = "id") final Long id) {
        return ResponseEntity.ok(diaNoHabilService.get(id));
    }

    @PostMapping
    @ApiResponse(responseCode = "201")
    public ResponseEntity<Long> createDiaNoHabil(
            @RequestBody @Valid final DiaNoHabilDTO diaNoHabilDTO) {
        final Long createdId = diaNoHabilService.create(diaNoHabilDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Long> updateDiaNoHabil(@PathVariable(name = "id") final Long id,
            @RequestBody @Valid final DiaNoHabilDTO diaNoHabilDTO) {
        diaNoHabilService.update(id, diaNoHabilDTO);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    @ApiResponse(responseCode = "204")
    public ResponseEntity<Void> deleteDiaNoHabil(@PathVariable(name = "id") final Long id) {
        diaNoHabilService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
