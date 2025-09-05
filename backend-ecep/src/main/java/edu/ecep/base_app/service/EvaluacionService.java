package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.Trimestre;
import edu.ecep.base_app.dtos.EvaluacionCreateDTO;
import edu.ecep.base_app.dtos.EvaluacionDTO;
import edu.ecep.base_app.mappers.EvaluacionMapper;
import edu.ecep.base_app.repos.EvaluacionRepository;
import edu.ecep.base_app.repos.MatriculaSeccionHistorialRepository;
import edu.ecep.base_app.repos.TrimestreRepository;
import edu.ecep.base_app.util.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EvaluacionService {
    private final EvaluacionRepository repo; private final EvaluacionMapper mapper; private final MatriculaSeccionHistorialRepository histRepo; private final TrimestreRepository trimRepo;
    public List<EvaluacionDTO> findAll(){ return repo.findAll(Sort.by("fecha").descending()).stream().map(mapper::toDto).toList(); }
    public Long create(EvaluacionCreateDTO dto){
        Trimestre tri = trimRepo.findById(dto.getTrimestreId()).orElseThrow(() -> new NotFoundException("No encontrado"));
        if(tri.isCerrado()) throw new IllegalArgumentException("Trimestre cerrado");
        return repo.save(mapper.toEntity(dto)).getId();
    }
}