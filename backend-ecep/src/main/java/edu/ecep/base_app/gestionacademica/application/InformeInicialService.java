package edu.ecep.base_app.gestionacademica.application;

import edu.ecep.base_app.gestionacademica.domain.InformeInicial;
import edu.ecep.base_app.gestionacademica.presentation.dto.InformeInicialCreateDTO;
import edu.ecep.base_app.gestionacademica.presentation.dto.InformeInicialDTO;
import edu.ecep.base_app.gestionacademica.infrastructure.mapper.InformeInicialMapper;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.InformeInicialRepository;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.TrimestreRepository;
import edu.ecep.base_app.shared.exception.NotFoundException;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service @RequiredArgsConstructor
public class InformeInicialService {
    private final InformeInicialRepository repo; private final InformeInicialMapper mapper; private final TrimestreRepository trimRepo;
    public List<InformeInicialDTO> findAll(){ return repo.findAll().stream().map(mapper::toDto).toList(); }
    public InformeInicialDTO get(Long id){
        return repo.findById(id).map(mapper::toDto).orElseThrow(NotFoundException::new);
    }
    public Long create(InformeInicialCreateDTO dto) {
        return repo.save(mapper.toEntity(dto)).getId();
    }
    public void update(Long id, InformeInicialDTO dto) {
        InformeInicial e = repo.findById(id).orElseThrow(NotFoundException::new);
        mapper.update(e, dto);
        repo.save(e);
    }
    public void delete(Long id){
        if(!repo.existsById(id)) throw new NotFoundException();
        repo.deleteById(id);
    }
}
