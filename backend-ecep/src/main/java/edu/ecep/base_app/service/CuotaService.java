package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.Cuota;
import edu.ecep.base_app.domain.enums.ConceptoCuota;
import edu.ecep.base_app.dtos.CuotaCreateDTO;
import edu.ecep.base_app.dtos.CuotaDTO;
import edu.ecep.base_app.mappers.CuotaMapper;
import edu.ecep.base_app.repos.CuotaRepository;
import edu.ecep.base_app.util.NotFoundException;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class CuotaService {
    private final CuotaRepository repo; private final CuotaMapper mapper;
    public List<CuotaDTO> findAll(){ return repo.findAll(Sort.by("anio","mes")).stream().map(mapper::toDto).toList(); }
    public Long create(CuotaCreateDTO dto){
        // reglas de unicidad por concepto
        if(dto.getConcepto()== ConceptoCuota.MENSUALIDAD && repo.existsByMatriculaIdAndAnioAndMesAndConcepto(dto.getMatriculaId(), dto.getAnio(), dto.getMes(), dto.getConcepto()))
            throw new IllegalArgumentException("Mensualidad duplicada");
        if(dto.getConcepto()==ConceptoCuota.MATRICULA && repo.existsByMatriculaIdAndAnioAndConcepto(dto.getMatriculaId(), dto.getAnio(), dto.getConcepto()))
            throw new IllegalArgumentException("Matrícula duplicada");
        return repo.save(mapper.toEntity(dto)).getId();
    }
}