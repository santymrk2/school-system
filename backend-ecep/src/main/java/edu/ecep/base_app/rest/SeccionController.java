package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.AlumnoLiteDTO;
import edu.ecep.base_app.dtos.SeccionCreateDTO;
import edu.ecep.base_app.dtos.SeccionDTO;
import edu.ecep.base_app.repos.AlumnoRepository;
import edu.ecep.base_app.repos.MatriculaRepository;
import edu.ecep.base_app.repos.MatriculaSeccionHistorialRepository;
import edu.ecep.base_app.service.SeccionService;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid SeccionCreateDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
    @GetMapping("/{id}/alumnos")
    public List<AlumnoLiteDTO> alumnosActivos(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {

        LocalDate f = (fecha != null) ? fecha : LocalDate.now();
        var activos = mshRepo.findActivosBySeccionOnDate(id, f);

        return activos.stream().map(m -> {
            var matricula = matriculaRepository.findById(m.getMatricula().getId()).orElseThrow();
            var alumno = alumnoRepository.findById(matricula.getAlumno().getId()).orElseThrow();
            String nombre = alumno.getApellido() + ", " + alumno.getNombre();
            return new AlumnoLiteDTO(matricula.getId(), alumno.getId(), nombre);
        }).toList();
    }
}