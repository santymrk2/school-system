package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.Trimestre;
import edu.ecep.base_app.domain.TrimestreEstado;
import edu.ecep.base_app.dtos.CalificacionTrimestralCreateDTO;
import edu.ecep.base_app.dtos.CalificacionTrimestralDTO;
import edu.ecep.base_app.mappers.CalificacionTrimestralMapper;
import edu.ecep.base_app.repos.CalificacionTrimestralRepository;
import edu.ecep.base_app.repos.TrimestreRepository;
import edu.ecep.base_app.util.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service @RequiredArgsConstructor
public class CalificacionTrimestralService {
    private final CalificacionTrimestralRepository repo; private final CalificacionTrimestralMapper mapper; private final TrimestreRepository trimRepo;
    public List<CalificacionTrimestralDTO> findAll(){ return repo.findAll().stream().map(mapper::toDto).toList(); }
    public CalificacionTrimestralDTO get(Long id){
        return repo.findById(id)
                .map(mapper::toDto)
                .orElseThrow(() -> new NotFoundException("No encontrado"));
    }
    public Long create(CalificacionTrimestralCreateDTO dto){
        Trimestre tri = trimRepo.findById(dto.getTrimestreId()).orElseThrow(() -> new NotFoundException("No encontrado"));
        if(tri.getEstado() != TrimestreEstado.ACTIVO) {
            throw new IllegalArgumentException("El trimestre no está activo");
        }
        if(repo.existsByTrimestreIdAndSeccionMateriaIdAndMatriculaId(dto.getTrimestreId(), dto.getSeccionMateriaId(), dto.getMatriculaId()))
            throw new IllegalArgumentException("Calificación trimestral duplicada");
        return repo.save(mapper.toEntity(dto)).getId();
    }

    public void update(Long id, CalificacionTrimestralDTO dto){
        var entity = repo.findById(id).orElseThrow(() -> new NotFoundException("No encontrado"));
        var trimestre = trimRepo.findById(dto.getTrimestreId()).orElseThrow(() -> new NotFoundException("No encontrado"));
        if(trimestre.getEstado() != TrimestreEstado.ACTIVO) {
            throw new IllegalArgumentException("El trimestre no está activo");
        }
        mapper.update(entity, dto);
        repo.save(entity);
    }

    public void delete(Long id){
        if(!repo.existsById(id)) throw new NotFoundException("No encontrado");
        repo.deleteById(id);
    }
}
