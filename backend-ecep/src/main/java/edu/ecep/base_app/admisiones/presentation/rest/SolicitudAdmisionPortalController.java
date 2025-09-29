package edu.ecep.base_app.admisiones.presentation.rest;

import edu.ecep.base_app.admisiones.application.SolicitudAdmisionService;
import edu.ecep.base_app.admisiones.presentation.dto.SolicitudAdmisionPortalDTO;
import edu.ecep.base_app.admisiones.presentation.dto.SolicitudAdmisionPortalSeleccionDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/solicitudes-admision")
@RequiredArgsConstructor
public class SolicitudAdmisionPortalController {

    private final SolicitudAdmisionService service;

    @GetMapping("/entrevista/{token}")
    public ResponseEntity<SolicitudAdmisionPortalDTO> obtenerPorToken(
            @PathVariable String token, @RequestParam(value = "email", required = false) String email) {
        return ResponseEntity.ok(service.obtenerDetallePortal(token, email));
    }

    @PostMapping("/entrevista/{token}/seleccionar")
    public ResponseEntity<SolicitudAdmisionPortalDTO> registrarRespuesta(
            @PathVariable String token,
            @RequestParam(value = "email", required = false) String email,
            @RequestBody @Valid SolicitudAdmisionPortalSeleccionDTO dto) {
        SolicitudAdmisionPortalDTO respuesta = service.responderDesdePortal(token, dto, email);
        return ResponseEntity.ok(respuesta);
    }
}
