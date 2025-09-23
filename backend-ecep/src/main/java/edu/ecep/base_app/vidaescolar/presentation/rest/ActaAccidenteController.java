package edu.ecep.base_app.vidaescolar.presentation.rest;

import edu.ecep.base_app.vidaescolar.presentation.dto.ActaAccidenteDTO;
import edu.ecep.base_app.vidaescolar.application.ActaAccidenteService;
import java.util.List;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import edu.ecep.base_app.vidaescolar.presentation.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;

@RestController
@RequestMapping("/api/actas-accidente")
@RequiredArgsConstructor
@Validated
public class ActaAccidenteController {
    private final ActaAccidenteService service;
    @GetMapping public List<ActaAccidenteDTO> list(){ return service.findAll(); }
    @GetMapping("/{id}") public ActaAccidenteDTO get(@PathVariable Long id){ return service.get(id); }
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
