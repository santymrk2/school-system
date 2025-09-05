package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.enums.RolSeccion;
import edu.ecep.base_app.dtos.AsignacionDocenteSeccionCreateDTO;
import edu.ecep.base_app.dtos.AsignacionDocenteSeccionDTO;
import edu.ecep.base_app.mappers.AsignacionDocenteSeccionMapper;
import edu.ecep.base_app.repos.AsignacionDocenteSeccionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AsignacionDocenteSeccionService {
    private final AsignacionDocenteSeccionRepository repo; private final AsignacionDocenteSeccionMapper mapper;
    public List<AsignacionDocenteSeccionDTO> findAll(){ return repo.findAll().stream().map(mapper::toDto).toList(); }
    public Long create(AsignacionDocenteSeccionCreateDTO dto){
        LocalDate hasta = dto.getVigenciaHasta()==null? LocalDate.of(9999,12,31): dto.getVigenciaHasta();
        if(dto.getRol()== RolSeccion.MAESTRO_TITULAR && repo.hasTitularOverlap(dto.getSeccionId(), dto.getVigenciaDesde(), hasta, null))
            throw new IllegalArgumentException("Ya hay un titular vigente en ese rango");
        return repo.save(mapper.toEntity(dto)).getId();
    }
}
