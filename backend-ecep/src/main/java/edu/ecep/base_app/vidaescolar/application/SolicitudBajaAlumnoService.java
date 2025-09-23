package edu.ecep.base_app.vidaescolar.application;

import edu.ecep.base_app.vidaescolar.presentation.dto.SolicitudBajaAlumnoCreateDTO;
import edu.ecep.base_app.vidaescolar.presentation.dto.SolicitudBajaAlumnoDTO;
import edu.ecep.base_app.vidaescolar.infrastructure.mapper.SolicitudBajaAlumnoMapper;
import edu.ecep.base_app.vidaescolar.infrastructure.persistence.SolicitudBajaAlumnoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service @RequiredArgsConstructor
public class SolicitudBajaAlumnoService {
    private final SolicitudBajaAlumnoRepository repo; private final SolicitudBajaAlumnoMapper mapper;
    public List<SolicitudBajaAlumnoDTO> findAll(){ return repo.findAll().stream().map(mapper::toDto).toList(); }
    public Long create(SolicitudBajaAlumnoCreateDTO dto){ return repo.save(mapper.toEntity(dto)).getId(); }
}
