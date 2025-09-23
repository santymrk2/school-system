package edu.ecep.base_app.identidad.presentation.rest;

import edu.ecep.base_app.identidad.application.EmpleadoService;
import edu.ecep.base_app.identidad.domain.enums.RolEmpleado;
import edu.ecep.base_app.identidad.presentation.dto.EmpleadoCreateDTO;
import edu.ecep.base_app.identidad.presentation.dto.EmpleadoDTO;
import edu.ecep.base_app.identidad.presentation.dto.EmpleadoUpdateDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController @RequestMapping("/api/empleados")
@RequiredArgsConstructor @Validated
public class EmpleadoController {
    private final EmpleadoService service;

    @GetMapping
    public List<EmpleadoDTO> list(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "rolEmpleado", required = false) RolEmpleado rolEmpleado
    ) {
        return service.findAll(search, rolEmpleado);
    }
    @GetMapping("/{id}") public EmpleadoDTO get(@PathVariable Long id){ return service.get(id); }
    @PostMapping public ResponseEntity<EmpleadoDTO> create(@RequestBody @Valid EmpleadoCreateDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
    @PutMapping("/{id}") public ResponseEntity<Void> update(@PathVariable Long id, @RequestBody @Valid EmpleadoUpdateDTO dto){ service.update(id, dto); return ResponseEntity.noContent().build(); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){ service.delete(id); return ResponseEntity.noContent().build(); }
}
