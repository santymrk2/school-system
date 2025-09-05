package edu.ecep.base_app.rest;

import edu.ecep.base_app.service.ReciboSueldoService;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.ecep.base_app.dtos.*;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;


@RestController
@RequestMapping("/api/recibos-sueldo")
@RequiredArgsConstructor
@Validated
public class ReciboSueldoController {
    private final ReciboSueldoService service;
    @GetMapping public List<ReciboSueldoDTO> list(){ return service.findAll(); }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid ReciboSueldoCreateDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
}
