package edu.ecep.base_app.identidad.presentation.rest;

import edu.ecep.base_app.identidad.application.AlumnoService;
import edu.ecep.base_app.identidad.presentation.dto.AlumnoDTO;
import edu.ecep.base_app.shared.web.PageResponse;
import jakarta.validation.Valid;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/alumnos")
@RequiredArgsConstructor
@Validated
public class AlumnoController {
    private final AlumnoService service;

    @GetMapping
    public List<AlumnoDTO> list() {
        return service.findAll();
    }

    @GetMapping("/paginated")
    public PageResponse<AlumnoDTO> listPaged(
            @PageableDefault(size = 25) Pageable pageable,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long seccionId) {
        return PageResponse.from(service.findPaged(pageable, search, seccionId));
    }

    @GetMapping("/{id}")
    public AlumnoDTO get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    public ResponseEntity<Long> create(@RequestBody @Valid AlumnoDTO dto) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable Long id, @RequestBody @Valid AlumnoDTO dto) {
        service.update(id, dto);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
