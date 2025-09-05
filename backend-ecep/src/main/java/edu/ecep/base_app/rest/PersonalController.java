package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.PersonalCreateDTO;
import edu.ecep.base_app.dtos.PersonalDTO;
import edu.ecep.base_app.dtos.PersonalUpdateDTO;
import edu.ecep.base_app.service.PersonalService;
import java.util.List;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;

@RestController @RequestMapping("/api/personal")
@RequiredArgsConstructor @Validated
public class PersonalController {
    private final PersonalService service;
    @GetMapping public List<PersonalDTO> list(){ return service.findAll(); }
    @GetMapping("/{id}") public PersonalDTO get(@PathVariable Long id){ return service.get(id); }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid PersonalCreateDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
    @PutMapping("/{id}") public ResponseEntity<Void> update(@PathVariable Long id, @RequestBody @Valid PersonalUpdateDTO dto){ service.update(id, dto); return ResponseEntity.noContent().build(); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){ service.delete(id); return ResponseEntity.noContent().build(); }
}
