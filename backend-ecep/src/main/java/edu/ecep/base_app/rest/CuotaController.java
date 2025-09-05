package edu.ecep.base_app.rest;

import edu.ecep.base_app.service.CuotaService;

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
@RequestMapping("/api/cuotas")
@RequiredArgsConstructor
@Validated
public class CuotaController {
    private final CuotaService service;
    @GetMapping public List<CuotaDTO> list(){ return service.findAll(); }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid CuotaCreateDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
}