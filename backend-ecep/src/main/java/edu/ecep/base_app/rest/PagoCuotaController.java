package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.PagoCuotaDTO;
import edu.ecep.base_app.service.PagoCuotaService;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import edu.ecep.base_app.dtos.*;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
@Validated
public class PagoCuotaController {
    private final PagoCuotaService service;
    @GetMapping public List<PagoCuotaDTO> list(){ return service.findAll(); }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid PagoCuotaCreateDTO dto){ return new ResponseEntity<>(service.crearPago(dto), HttpStatus.CREATED); }
    @PatchMapping("/{id}/estado") public ResponseEntity<Void> actualizarEstado(@PathVariable Long id, @RequestBody @Valid PagoCuotaEstadoUpdateDTO dto){ service.actualizarEstado(id, dto); return ResponseEntity.noContent().build(); }
}
