package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.Matricula;
import edu.ecep.base_app.dtos.MatriculaCreateDTO;
import edu.ecep.base_app.dtos.MatriculaDTO;
import edu.ecep.base_app.mappers.MatriculaMapper;
import edu.ecep.base_app.repos.MatriculaRepository;
import edu.ecep.base_app.util.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;


@Service @RequiredArgsConstructor
public class MatriculaService {
    private final MatriculaRepository repo; private final MatriculaMapper mapper;
    public List<MatriculaDTO> findAll(){ return repo.findAll().stream().map(mapper::toDto).toList(); }
    public Long create(MatriculaCreateDTO dto){
        if(repo.existsByAlumnoIdAndPeriodoEscolarId(dto.getAlumnoId(), dto.getPeriodoEscolarId()))
            throw new IllegalArgumentException("El alumno ya tiene matrícula en ese periodo");
        return repo.save(mapper.toEntity(dto)).getId();
    }
}
