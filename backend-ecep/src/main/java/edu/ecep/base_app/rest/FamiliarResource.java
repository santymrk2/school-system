package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.FamiliarDTO;
import edu.ecep.base_app.service.FamiliarService;
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
@RequestMapping(value = "/api/familiares", produces = MediaType.APPLICATION_JSON_VALUE)
public class FamiliarResource {

    private final FamiliarService familiarService;

    public FamiliarResource(final FamiliarService familiarService) {
        this.familiarService = familiarService;
    }

    @GetMapping
    public ResponseEntity<List<FamiliarDTO>> getAllFamiliars() {
        return ResponseEntity.ok(familiarService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FamiliarDTO> getFamiliar(@PathVariable(name = "id") final Long id) {
        return ResponseEntity.ok(familiarService.get(id));
    }

    @PostMapping
    @ApiResponse(responseCode = "201")
    public ResponseEntity<Long> createFamiliar(@RequestBody @Valid final FamiliarDTO familiarDTO) {
        final Long createdId = familiarService.create(familiarDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Long> updateFamiliar(@PathVariable(name = "id") final Long id,
            @RequestBody @Valid final FamiliarDTO familiarDTO) {
        familiarService.update(id, familiarDTO);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    @ApiResponse(responseCode = "204")
    public ResponseEntity<Void> deleteFamiliar(@PathVariable(name = "id") final Long id) {

        familiarService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
