package edu.ecep.base_app.service;

import edu.ecep.base_app.dtos.PeriodoEscolarCreateDTO;
import edu.ecep.base_app.dtos.PeriodoEscolarDTO;
import edu.ecep.base_app.mappers.PeriodoEscolarMapper;
import edu.ecep.base_app.repos.PeriodoEscolarRepository;
import edu.ecep.base_app.util.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PeriodoEscolarService {
    private final PeriodoEscolarRepository repo; private final PeriodoEscolarMapper mapper;
    public List<PeriodoEscolarDTO> findAll(){ return repo.findAll(Sort.by("anio")).stream().map(mapper::toDto).toList(); }
    public PeriodoEscolarDTO get(Long id){ return repo.findById(id).map(mapper::toDto).orElseThrow(() -> new NotFoundException("No encontrado")); }
    public Long create(PeriodoEscolarCreateDTO dto){ if(repo.existsByAnio(dto.getAnio())) throw new IllegalArgumentException("Ya existe periodo para ese año"); return repo.save(mapper.toEntity(dto)).getId(); }

    @Transactional
    public void cerrar(Long id){
        var periodo = repo.findById(id).orElseThrow(() -> new NotFoundException("No encontrado"));
        periodo.setActivo(false);
        repo.save(periodo);
    }

    @Transactional
    public void abrir(Long id){
        var periodo = repo.findById(id).orElseThrow(() -> new NotFoundException("No encontrado"));
        periodo.setActivo(true);
        repo.save(periodo);
    }
}



