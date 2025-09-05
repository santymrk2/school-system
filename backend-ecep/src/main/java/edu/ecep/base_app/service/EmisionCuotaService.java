package edu.ecep.base_app.service;

import edu.ecep.base_app.dtos.EmisionCuotaCreateDTO;
import edu.ecep.base_app.dtos.EmisionCuotaDTO;
import edu.ecep.base_app.mappers.EmisionCuotaMapper;
import edu.ecep.base_app.repos.EmisionCuotaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmisionCuotaService {
    private final EmisionCuotaRepository repo; private final EmisionCuotaMapper mapper;
    public List<EmisionCuotaDTO> findAll(){ return repo.findAll(Sort.by("fechaEmision").descending()).stream().map(mapper::toDto).toList(); }
    public Long create(EmisionCuotaCreateDTO dto){ return repo.save(mapper.toEntity(dto)).getId(); }
}
