package edu.ecep.base_app.vidaescolar.presentation.rest;

import edu.ecep.base_app.vidaescolar.application.SolicitudBajaAlumnoService;
import edu.ecep.base_app.vidaescolar.presentation.dto.SolicitudBajaAlumnoCreateDTO;
import edu.ecep.base_app.vidaescolar.presentation.dto.SolicitudBajaAlumnoDTO;
import edu.ecep.base_app.vidaescolar.presentation.dto.SolicitudBajaAlumnoDecisionDTO;
import edu.ecep.base_app.vidaescolar.presentation.dto.SolicitudBajaAlumnoRechazoDTO;
import edu.ecep.base_app.vidaescolar.presentation.dto.SolicitudBajaAlumnoRevisionAdministrativaDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bajas")
@RequiredArgsConstructor
@Validated
public class SolicitudBajaAlumnoController {

    private final SolicitudBajaAlumnoService service;

    @GetMapping
    public List<SolicitudBajaAlumnoDTO> list() {
        return service.findAll();
    }

    @GetMapping("/historial")
    public List<SolicitudBajaAlumnoDTO> historial() {
        return service.findHistorial();
    }

    @PostMapping
    public ResponseEntity<Long> create(@RequestBody @Valid SolicitudBajaAlumnoCreateDTO dto) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/revision-administrativa")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void registrarRevisionAdministrativa(
            @PathVariable Long id,
            @RequestBody @Valid SolicitudBajaAlumnoRevisionAdministrativaDTO dto) {
        service.registrarRevisionAdministrativa(id, dto);
    }

    @PostMapping("/{id}/aprobar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void aprobar(
            @PathVariable Long id, @RequestBody @Valid SolicitudBajaAlumnoDecisionDTO dto) {
        service.aprobar(id, dto);
    }

    @PostMapping("/{id}/rechazar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void rechazar(
            @PathVariable Long id, @RequestBody @Valid SolicitudBajaAlumnoRechazoDTO dto) {
        service.rechazar(id, dto);
    }
}
