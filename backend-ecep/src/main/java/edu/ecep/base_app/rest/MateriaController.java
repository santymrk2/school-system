package edu.ecep.base_app.rest;

import edu.ecep.base_app.dtos.MateriaCreateDTO;
import edu.ecep.base_app.dtos.MateriaDTO;
import edu.ecep.base_app.service.MateriaService;

import java.util.List;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController @RequestMapping("/api/materias")
@RequiredArgsConstructor @Validated
public class MateriaController {
    private final MateriaService service;
    @GetMapping public List<MateriaDTO> list(){ return service.findAll(); }
    @PostMapping public ResponseEntity<Long> create(@RequestBody @Valid MateriaCreateDTO dto){ return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED); }
}