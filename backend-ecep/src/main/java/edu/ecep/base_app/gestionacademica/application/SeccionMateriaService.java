package edu.ecep.base_app.gestionacademica.application;

import edu.ecep.base_app.gestionacademica.presentation.dto.SeccionMateriaCreateDTO;
import edu.ecep.base_app.gestionacademica.presentation.dto.SeccionMateriaDTO;
import edu.ecep.base_app.gestionacademica.infrastructure.mapper.SeccionMateriaMapper;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.SeccionMateriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SeccionMateriaService {
    private final SeccionMateriaRepository repo; private final SeccionMateriaMapper mapper;
    public List<SeccionMateriaDTO> findAll(){ return repo.findAll().stream().map(mapper::toDto).toList(); }
    public Long create(SeccionMateriaCreateDTO dto){ if(repo.existsBySeccionIdAndMateriaId(dto.getSeccionId(), dto.getMateriaId())) throw new IllegalArgumentException("Materia ya asignada al plan de estudio"); return repo.save(mapper.toEntity(dto)).getId(); }
}