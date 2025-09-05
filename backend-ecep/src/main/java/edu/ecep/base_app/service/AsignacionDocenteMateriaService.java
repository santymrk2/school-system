package edu.ecep.base_app.service;


import edu.ecep.base_app.domain.enums.RolMateria;
import edu.ecep.base_app.dtos.AsignacionDocenteMateriaCreateDTO;
import edu.ecep.base_app.dtos.AsignacionDocenteMateriaDTO;
import edu.ecep.base_app.mappers.AsignacionDocenteMateriaMapper;
import edu.ecep.base_app.repos.AsignacionDocenteMateriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AsignacionDocenteMateriaService {
    private final AsignacionDocenteMateriaRepository repo; private final AsignacionDocenteMateriaMapper mapper;
    public List<AsignacionDocenteMateriaDTO> findAll(){ return repo.findAll().stream().map(mapper::toDto).toList(); }
    public Long create(AsignacionDocenteMateriaCreateDTO dto){
        LocalDate hasta = dto.getVigenciaHasta()==null? LocalDate.of(9999,12,31): dto.getVigenciaHasta();
        if(dto.getRol()== RolMateria.TITULAR && repo.hasTitularOverlap(dto.getSeccionMateriaId(), dto.getVigenciaDesde(), hasta, null))
            throw new IllegalArgumentException("Ya hay un titular vigente en ese rango");
        return repo.save(mapper.toEntity(dto)).getId();
    }
}
