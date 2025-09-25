package edu.ecep.base_app.gestionacademica.application;

import edu.ecep.base_app.gestionacademica.domain.Seccion;
import edu.ecep.base_app.gestionacademica.infrastructure.mapper.SeccionMapper;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.SeccionRepository;
import edu.ecep.base_app.gestionacademica.presentation.dto.SeccionCreateDTO;
import edu.ecep.base_app.gestionacademica.presentation.dto.SeccionDTO;
import edu.ecep.base_app.shared.exception.NotFoundException;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SeccionService {
    private final SeccionRepository repo;
    private final SeccionMapper mapper;

    public List<SeccionDTO> findAll() {
        Sort sort = Sort.by("periodoEscolar.id", "nivel", "gradoSala", "division");
        List<Seccion> activas = repo.findAllByPeriodoEscolarActivoTrue(sort);
        List<Seccion> source = activas.isEmpty() ? repo.findAll(sort) : activas;
        return source.stream().map(mapper::toDto).toList();
    }

    public Long create(SeccionCreateDTO dto){
        if(repo.existsByPeriodoEscolarIdAndNivelAndGradoSalaAndDivisionAndTurno(dto.getPeriodoEscolarId(), dto.getNivel(), dto.getGradoSala(), dto.getDivision(), dto.getTurno()))
            throw new IllegalArgumentException("La sección ya existe en ese periodo");
        return repo.save(mapper.toEntity(dto)).getId();
    }

    public SeccionDTO get(Long id){
        return repo.findById(id)
                .map(mapper::toDto)
                .orElseThrow(NotFoundException::new);
    }

    public void update(Long id, SeccionDTO dto){
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
