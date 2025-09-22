package edu.ecep.base_app.rest;

import edu.ecep.base_app.domain.MatriculaSeccionHistorial;
import edu.ecep.base_app.domain.Seccion;
import edu.ecep.base_app.dtos.AlumnoLiteDTO;
import edu.ecep.base_app.dtos.FamiliarDTO;
import edu.ecep.base_app.repos.AlumnoFamiliarRepository;
import edu.ecep.base_app.repos.MatriculaRepository;
import edu.ecep.base_app.repos.MatriculaSeccionHistorialRepository;
import edu.ecep.base_app.service.FamiliarService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import lombok.RequiredArgsConstructor;
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
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/familiares")
@RequiredArgsConstructor
@Validated
public class FamiliarController {
    private final FamiliarService service;
    private final AlumnoFamiliarRepository repoFam;
    private final MatriculaRepository matriculaRepo;
    private final MatriculaSeccionHistorialRepository historialRepo;

    @GetMapping public List<FamiliarDTO> list(){ return service.findAll(); }
    @GetMapping("/{id}") public FamiliarDTO get(@PathVariable Long id){ return service.get(id); }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid FamiliarDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
    @PutMapping("/{id}") public ResponseEntity<Void> update(@PathVariable Long id, @RequestBody @Valid FamiliarDTO dto){ service.update(id, dto); return ResponseEntity.noContent().build(); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){ service.delete(id); return ResponseEntity.noContent().build(); }
    @GetMapping("/{familiarId}/alumnos")
    public List<AlumnoLiteDTO> alumnos(@PathVariable Long familiarId) {
        var alumnos = repoFam.findAlumnosByFamiliar(familiarId);

        // mapear a (matriculaId, alumnoId, nombre)
        return alumnos.stream().flatMap(al -> {
            var mats = matriculaRepo.findByAlumnoId(al.getId());
            var p = al.getPersona();
            String nombre = Optional.ofNullable(p)
                    .map(px -> (px.getApellido() != null ? px.getApellido() : "") +
                            (px.getNombre() != null ? (", " + px.getNombre()) : ""))
                    .orElse("#" + al.getId());

            return mats.stream().flatMap(m -> {
                var vigente = historialRepo.findVigente(m.getId(), LocalDate.now()).stream().findFirst();
                if (vigente.isEmpty()) {
                    return Stream.empty();
                }
                var seccion = vigente.map(MatriculaSeccionHistorial::getSeccion);
                Long seccionId = seccion.map(Seccion::getId).orElse(null);
                if (seccionId == null) {
                    return Stream.empty();
                }
                String seccionNombre = seccion.map(this::buildSeccionNombre).orElse(null);
                var nivel = seccion.map(Seccion::getNivel).orElse(null);
                return Stream.of(new AlumnoLiteDTO(
                        m.getId(),
                        al.getId(),
                        nombre,
                        seccionId,
                        seccionNombre,
                        nivel
                ));
            });
        }).toList();
    }

    private String buildSeccionNombre(Seccion seccion) {
        if (seccion == null) return null;
        var grado = Optional.ofNullable(seccion.getGradoSala()).orElse("");
        var division = Optional.ofNullable(seccion.getDivision()).orElse("");
        var turno = Optional.ofNullable(seccion.getTurno()).map(Enum::name).orElse("");
        String base = (grado + " " + division).trim();
        if (base.isEmpty()) base = "Sección";
        return turno.isEmpty() ? base : base + " (" + turno + ")";
    }
}
