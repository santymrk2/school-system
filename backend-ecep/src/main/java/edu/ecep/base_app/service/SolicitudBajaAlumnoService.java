package edu.ecep.base_app.service;

import edu.ecep.base_app.dtos.SolicitudBajaAlumnoCreateDTO;
import edu.ecep.base_app.dtos.SolicitudBajaAlumnoDTO;
import edu.ecep.base_app.mappers.SolicitudBajaAlumnoMapper;
import edu.ecep.base_app.repos.SolicitudBajaAlumnoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service @RequiredArgsConstructor
public class SolicitudBajaAlumnoService {
    private final SolicitudBajaAlumnoRepository repo; private final SolicitudBajaAlumnoMapper mapper;
    public List<SolicitudBajaAlumnoDTO> findAll(){ return repo.findAll().stream().map(mapper::toDto).toList(); }
    public Long create(SolicitudBajaAlumnoCreateDTO dto){ return repo.save(mapper.toEntity(dto)).getId(); }
}
