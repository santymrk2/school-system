package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.ActaAccidenteDTO;
import edu.ecep.base_app.service.ActaAccidenteService;
import java.util.List;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import edu.ecep.base_app.dtos.*;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;

@RestController
@RequestMapping("/api/actas-accidente")
@RequiredArgsConstructor
@Validated
public class ActaAccidenteController {
    private final ActaAccidenteService service;
    @GetMapping public List<ActaAccidenteDTO> list(){ return service.findAll(); }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid ActaAccidenteCreateDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
    @PutMapping("/{id}")
    public ResponseEntity<Void> update(
            @PathVariable Long id,
            @RequestBody @Valid ActaAccidenteUpdateDTO dto
    ) {
        service.update(id, dto);
        return ResponseEntity.noContent().build(); // 204
    }

    // ELIMINAR
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build(); // 204
    }

}