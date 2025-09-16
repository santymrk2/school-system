package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.SeccionDTO;
import edu.ecep.base_app.dtos.asistencia.*;
import edu.ecep.base_app.service.AsistenciaQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/asistencias")
@RequiredArgsConstructor
public class AsistenciaQueryController {

    private final AsistenciaQueryService service;

    // Docente → secciones vigentes (reusa SeccionDTO)
    @GetMapping("/docentes/{empleadoId}/secciones")
    public List<SeccionDTO> seccionesVigentesDocente(
            @PathVariable Long empleadoId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha
    ) {
        return service.seccionesVigentesDocente(empleadoId, fecha != null ? fecha : LocalDate.now());
    }

    // Historial diario agregado de una sección
    @GetMapping("/secciones/{seccionId}/historial")
    public List<AsistenciaDiaDTO> historialSeccion(
            @PathVariable Long seccionId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return service.historialSeccion(seccionId, from, to);
    }

    // Acumulado/porcentaje en rango
    @GetMapping("/secciones/{seccionId}/acumulado")
    public AsistenciaAcumuladoDTO acumuladoSeccion(
            @PathVariable Long seccionId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return service.acumuladoSeccion(seccionId, from, to);
    }

    // Resumen por alumno (para la tabla)
    @GetMapping("/secciones/{seccionId}/alumnos-resumen")
    public List<AsistenciaAlumnoResumenDTO> resumenPorAlumno(
            @PathVariable Long seccionId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return service.resumenPorAlumno(seccionId, from, to);
    }
}
