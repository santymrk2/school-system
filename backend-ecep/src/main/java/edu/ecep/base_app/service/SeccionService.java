package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.*;

import edu.ecep.base_app.dtos.SeccionCreateDTO;
import edu.ecep.base_app.dtos.SeccionDTO;
import edu.ecep.base_app.mappers.SeccionMapper;
import edu.ecep.base_app.repos.*;
import edu.ecep.base_app.util.NotFoundException;
import edu.ecep.base_app.util.ReferencedException;
import edu.ecep.base_app.util.ReferencedWarning;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class SeccionService {
    private final SeccionRepository repo; private final SeccionMapper mapper;
    public List<SeccionDTO> findAll(){ return repo.findAll(Sort.by("periodoEscolar.id","nivel","gradoSala","division")).stream().map(mapper::toDto).toList(); }
    public Long create(SeccionCreateDTO dto){
        if(repo.existsByPeriodoEscolarIdAndNivelAndGradoSalaAndDivisionAndTurno(dto.getPeriodoEscolarId(), dto.getNivel(), dto.getGradoSala(), dto.getDivision(), dto.getTurno()))
            throw new IllegalArgumentException("La sección ya existe en ese periodo");
        return repo.save(mapper.toEntity(dto)).getId();
    }
}