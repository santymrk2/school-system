package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.DireccionConfiguracionDTO;
import edu.ecep.base_app.dtos.PeriodoEscolarCreateDTO;
import edu.ecep.base_app.dtos.PeriodoEscolarDTO;
import edu.ecep.base_app.dtos.TrimestreDTO;
import edu.ecep.base_app.service.DireccionConfiguracionService;
import edu.ecep.base_app.service.PeriodoEscolarService;
import edu.ecep.base_app.service.TrimestreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/direccion/configuracion")
@RequiredArgsConstructor
public class DireccionConfiguracionController {

    private final DireccionConfiguracionService configService;
    private final PeriodoEscolarService periodoService;
    private final TrimestreService trimestreService;

    @GetMapping
    public DireccionConfiguracionDTO obtenerConfiguracionActual() {
        return configService.obtenerConfiguracionActual();
    }

    @GetMapping("/periodos")
    public List<PeriodoEscolarDTO> listarPeriodos() {
        return periodoService.findAll();
    }

    @GetMapping("/periodos/{periodoId}")
    public DireccionConfiguracionDTO obtenerConfiguracionPorPeriodo(@PathVariable Long periodoId) {
        return configService.obtenerConfiguracionPorPeriodo(periodoId);
    }

    @GetMapping("/periodos/{periodoId}/trimestres")
    public List<TrimestreDTO> listarTrimestresPorPeriodo(@PathVariable Long periodoId) {
        return trimestreService.listByPeriodo(periodoId);
    }

    @PostMapping("/periodos")
    public ResponseEntity<Long> crearPeriodo(@RequestBody @Valid PeriodoEscolarCreateDTO dto) {
        Long id = periodoService.create(dto);
        return new ResponseEntity<>(id, HttpStatus.CREATED);
    }

    @PostMapping("/periodos/{id}/cerrar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cerrarPeriodo(@PathVariable Long id) {
        periodoService.cerrar(id);
    }

    @PostMapping("/periodos/{id}/reabrir")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reabrirPeriodo(@PathVariable Long id) {
        periodoService.reabrir(id);
    }

    @PutMapping("/trimestres/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void actualizarTrimestre(@PathVariable Long id, @RequestBody @Valid TrimestreDTO dto) {
        trimestreService.update(id, dto);
    }

    @PostMapping("/trimestres/{id}/cerrar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cerrarTrimestre(@PathVariable Long id) {
        trimestreService.cerrar(id);
    }

    @PostMapping("/trimestres/{id}/reabrir")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reabrirTrimestre(@PathVariable Long id) {
        trimestreService.reabrir(id);
    }
}
