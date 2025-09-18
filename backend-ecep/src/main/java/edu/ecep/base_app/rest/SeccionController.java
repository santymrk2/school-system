package edu.ecep.base_app.rest;

import edu.ecep.base_app.domain.Seccion;
import edu.ecep.base_app.dtos.AlumnoLiteDTO;
import edu.ecep.base_app.dtos.SeccionCreateDTO;
import edu.ecep.base_app.dtos.SeccionDTO;
import edu.ecep.base_app.repos.AlumnoRepository;
import edu.ecep.base_app.repos.MatriculaRepository;
import edu.ecep.base_app.repos.MatriculaSeccionHistorialRepository;
import edu.ecep.base_app.service.SeccionService;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;


import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;

@RestController @RequestMapping("/api/secciones")
@RequiredArgsConstructor @Validated
public class SeccionController {
    private final SeccionService service;
    private final MatriculaRepository matriculaRepository;
    private final AlumnoRepository alumnoRepository;
    private final MatriculaSeccionHistorialRepository mshRepo;

    @GetMapping public List<SeccionDTO> list(){ return service.findAll(); }
    @GetMapping("/{id}") public SeccionDTO get(@PathVariable Long id){ return service.get(id); }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid SeccionCreateDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
    @PutMapping("/{id}") public ResponseEntity<Void> update(@PathVariable Long id, @RequestBody @Valid SeccionDTO dto){ service.update(id, dto); return ResponseEntity.noContent().build(); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){ service.delete(id); return ResponseEntity.noContent().build(); }
    @GetMapping("/{id}/alumnos")
    @Transactional(readOnly=true)
    public List<AlumnoLiteDTO> alumnosActivos(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {

        LocalDate f = (fecha != null) ? fecha : LocalDate.now();
        var activos = mshRepo.findActivosBySeccionOnDate(id, f);

        return activos.stream().map(m -> {
            var matricula = matriculaRepository.findById(m.getMatricula().getId()).orElseThrow();
            var alumno = alumnoRepository.findById(matricula.getAlumno().getId()).orElseThrow();
            String nombre = Optional.ofNullable(alumno.getPersona())
                    .map(p -> (p.getApellido() != null ? p.getApellido() : "") +
                            ", " +
                            (p.getNombre() != null ? p.getNombre() : ""))
                    .orElse("#" + alumno.getId());
            var seccion = m.getSeccion();
            return new AlumnoLiteDTO(
                    matricula.getId(),
                    alumno.getId(),
                    nombre,
                    seccion != null ? seccion.getId() : null,
                    buildSeccionNombre(seccion),
                    seccion != null ? seccion.getNivel() : null
            );
        }).toList();
    }

    private String buildSeccionNombre(Seccion seccion) {
        if (seccion == null) return null;
        var base = ((Optional.ofNullable(seccion.getGradoSala()).orElse("")) +
                " " +
                Optional.ofNullable(seccion.getDivision()).orElse(""))
                .trim();
        if (base.isEmpty()) base = "Sección";
        var turno = Optional.ofNullable(seccion.getTurno()).map(Enum::name).orElse("");
        return turno.isEmpty() ? base : base + " (" + turno + ")";
    }
}
