package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.InformeInicial;
import edu.ecep.base_app.domain.Trimestre;
import edu.ecep.base_app.dtos.InformeInicialCreateDTO;
import edu.ecep.base_app.dtos.InformeInicialDTO;
import edu.ecep.base_app.mappers.InformeInicialMapper;
import edu.ecep.base_app.repos.*;
import edu.ecep.base_app.util.NotFoundException;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service @RequiredArgsConstructor
public class InformeInicialService {
    private final InformeInicialRepository repo; private final InformeInicialMapper mapper; private final TrimestreRepository trimRepo;
    public List<InformeInicialDTO> findAll(){ return repo.findAll().stream().map(mapper::toDto).toList(); }
    public Long create(InformeInicialCreateDTO dto) {
        return repo.save(mapper.toEntity(dto)).getId();
    }
    public void update(Long id, InformeInicialDTO dto) {
        InformeInicial e = repo.findById(id).orElseThrow(NotFoundException::new);
        mapper.update(e, dto);
    }
}