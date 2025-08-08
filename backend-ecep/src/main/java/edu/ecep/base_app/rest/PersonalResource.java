package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.PersonalDTO;
import edu.ecep.base_app.service.PersonalService;
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
@RequestMapping(value = "/api/personal", produces = MediaType.APPLICATION_JSON_VALUE)
public class PersonalResource {

    private final PersonalService personalService;

    public PersonalResource(final PersonalService personalService) {
        this.personalService = personalService;
    }

    @GetMapping
    public ResponseEntity<List<PersonalDTO>> getAllPersonals() {
        return ResponseEntity.ok(personalService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonalDTO> getPersonal(@PathVariable(name = "id") final Long id) {
        return ResponseEntity.ok(personalService.get(id));
    }

    @PostMapping
    @ApiResponse(responseCode = "201")
    public ResponseEntity<Long> createPersonal(@RequestBody @Valid final PersonalDTO personalDTO) {
        final Long createdId = personalService.create(personalDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Long> updatePersonal(@PathVariable(name = "id") final Long id,
            @RequestBody @Valid final PersonalDTO personalDTO) {
        personalService.update(id, personalDTO);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    @ApiResponse(responseCode = "204")
    public ResponseEntity<Void> deletePersonal(@PathVariable(name = "id") final Long id) {
        personalService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
