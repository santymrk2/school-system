package edu.ecep.base_app.rest;


import edu.ecep.base_app.dtos.*;
import edu.ecep.base_app.service.EmisionCuotaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/emisiones-cuota")
@RequiredArgsConstructor
@Validated
public class EmisionCuotaController {
    private final EmisionCuotaService service;
    @GetMapping public List<EmisionCuotaDTO> list(){ return service.findAll(); }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid EmisionCuotaCreateDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
}