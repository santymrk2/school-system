package edu.ecep.base_app.vidaescolar.application;

import edu.ecep.base_app.vidaescolar.domain.Matricula;
import edu.ecep.base_app.vidaescolar.presentation.dto.MatriculaCreateDTO;
import edu.ecep.base_app.vidaescolar.presentation.dto.MatriculaDTO;
import edu.ecep.base_app.vidaescolar.infrastructure.mapper.MatriculaMapper;
import edu.ecep.base_app.vidaescolar.infrastructure.persistence.MatriculaRepository;
import edu.ecep.base_app.shared.exception.NotFoundException;
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

    public MatriculaDTO get(Long id){
        return repo.findById(id)
                .map(mapper::toDto)
                .orElseThrow(NotFoundException::new);
    }

    public void update(Long id, MatriculaDTO dto){
        var entity = repo.findById(id).orElseThrow(NotFoundException::new);
        mapper.update(entity, dto);
        repo.save(entity);
    }

    public void delete(Long id){
        if(!repo.existsById(id)){
            throw new NotFoundException();
        }
        repo.deleteById(id);
    }
}
