package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.AspiranteFamiliarDTO;
import edu.ecep.base_app.service.AspiranteFamiliarService;
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
@RequestMapping(value = "/api/aspirante-familiar", produces = MediaType.APPLICATION_JSON_VALUE)
public class AspiranteFamiliarController {

    private final AspiranteFamiliarService aspiranteFamiliarService;

    public AspiranteFamiliarController(final AspiranteFamiliarService aspiranteFamiliarService) {
        this.aspiranteFamiliarService = aspiranteFamiliarService;
    }

    @GetMapping
    public ResponseEntity<List<AspiranteFamiliarDTO>> getAllAspiranteFamiliars() {
        return ResponseEntity.ok(aspiranteFamiliarService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AspiranteFamiliarDTO> getAspiranteFamiliar(
            @PathVariable(name = "id") final Long id) {
        return ResponseEntity.ok(aspiranteFamiliarService.get(id));
    }

    @PostMapping
    @ApiResponse(responseCode = "201")
    public ResponseEntity<Long> createAspiranteFamiliar(
            @RequestBody @Valid final AspiranteFamiliarDTO aspiranteFamiliarDTO) {
        final Long createdId = aspiranteFamiliarService.create(aspiranteFamiliarDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Long> updateAspiranteFamiliar(@PathVariable(name = "id") final Long id,
            @RequestBody @Valid final AspiranteFamiliarDTO aspiranteFamiliarDTO) {
        aspiranteFamiliarService.update(id, aspiranteFamiliarDTO);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    @ApiResponse(responseCode = "204")
    public ResponseEntity<Void> deleteAspiranteFamiliar(@PathVariable(name = "id") final Long id) {
        aspiranteFamiliarService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
