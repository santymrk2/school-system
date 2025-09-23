package edu.ecep.base_app.calendario.application;

import edu.ecep.base_app.calendario.presentation.dto.PeriodoEscolarCreateDTO;
import edu.ecep.base_app.calendario.presentation.dto.PeriodoEscolarDTO;
import edu.ecep.base_app.calendario.infrastructure.mapper.PeriodoEscolarMapper;
import edu.ecep.base_app.calendario.infrastructure.persistence.PeriodoEscolarRepository;
import edu.ecep.base_app.shared.exception.NotFoundException;
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



