package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.Trimestre;
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
    public Long create(CalificacionTrimestralCreateDTO dto){
        Trimestre tri = trimRepo.findById(dto.getTrimestreId()).orElseThrow(() -> new NotFoundException("No encontrado"));
        if(tri.isCerrado()) throw new IllegalArgumentException("Trimestre cerrado");
        if(repo.existsByTrimestreIdAndSeccionMateriaIdAndMatriculaId(dto.getTrimestreId(), dto.getSeccionMateriaId(), dto.getMatriculaId()))
            throw new IllegalArgumentException("Calificación trimestral duplicada");
        return repo.save(mapper.toEntity(dto)).getId();
    }
}