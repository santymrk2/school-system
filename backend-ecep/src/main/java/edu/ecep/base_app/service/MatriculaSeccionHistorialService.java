package edu.ecep.base_app.service;

import edu.ecep.base_app.dtos.MatriculaSeccionHistorialCreateDTO;
import edu.ecep.base_app.dtos.MatriculaSeccionHistorialDTO;
import edu.ecep.base_app.mappers.MatriculaSeccionHistorialMapper;
import edu.ecep.base_app.repos.MatriculaSeccionHistorialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MatriculaSeccionHistorialService {
    private final MatriculaSeccionHistorialRepository repo; private final MatriculaSeccionHistorialMapper mapper;
    public List<MatriculaSeccionHistorialDTO> findAll(){ return repo.findAll(Sort.by("matricula.id","desde").descending()).stream().map(mapper::toDto).toList(); }
    public Long asignar(MatriculaSeccionHistorialCreateDTO dto){
        if(dto.getHasta()!=null && dto.getHasta().isBefore(dto.getDesde())) throw new IllegalArgumentException("Rango inválido");
        // NOTA: acá podrías validar solapamientos con una consulta adicional
        return repo.save(mapper.toEntity(dto)).getId();
    }
}