package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.ReciboSueldo;
import edu.ecep.base_app.dtos.ReciboSueldoCreateDTO;
import edu.ecep.base_app.dtos.ReciboSueldoDTO;
import edu.ecep.base_app.mappers.ReciboSueldoMapper;
import edu.ecep.base_app.repos.ReciboSueldoRepository;
import edu.ecep.base_app.util.NotFoundException;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class ReciboSueldoService {
    private final ReciboSueldoRepository repo; private final ReciboSueldoMapper mapper;
    public List<ReciboSueldoDTO> findAll(){ return repo.findAll(Sort.by("anio","mes")).stream().map(mapper::toDto).toList(); }
    public Long create(ReciboSueldoCreateDTO dto){ return repo.save(mapper.toEntity(dto)).getId(); }
}

