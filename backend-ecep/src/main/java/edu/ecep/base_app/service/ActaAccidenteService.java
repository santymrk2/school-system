package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.ActaAccidente;
import edu.ecep.base_app.mappers.ActaAccidenteMapper;
import edu.ecep.base_app.dtos.ActaAccidenteDTO;
import edu.ecep.base_app.repos.ActaAccidenteRepository;
import edu.ecep.base_app.util.NotFoundException;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class ActaAccidenteService {

    private final ActaAccidenteRepository actaAccidenteRepository;
    private final ActaAccidenteMapper actaAccidenteMapper;

    public ActaAccidenteService(ActaAccidenteRepository actaAccidenteRepository,
                                ActaAccidenteMapper actaAccidenteMapper) {
        this.actaAccidenteRepository = actaAccidenteRepository;
        this.actaAccidenteMapper = actaAccidenteMapper;
    }

    public List<ActaAccidenteDTO> findAll() {
        return actaAccidenteRepository.findAll(Sort.by("id")).stream()
                .map(actaAccidenteMapper::toDto)
                .toList();
    }

    public ActaAccidenteDTO get(Long id) {
        return actaAccidenteRepository.findById(id)
                .map(actaAccidenteMapper::toDto)
                .orElseThrow(NotFoundException::new);
    }

    public Long create(ActaAccidenteDTO dto) {
        ActaAccidente entity = actaAccidenteMapper.toEntity(dto);
        return actaAccidenteRepository.save(entity).getId();
    }

    public void update(Long id, ActaAccidenteDTO dto) {
        ActaAccidente existing = actaAccidenteRepository.findById(id)
                .orElseThrow(NotFoundException::new);
        actaAccidenteMapper.updateEntityFromDto(dto, existing);
        actaAccidenteRepository.save(existing);
    }

    public void delete(Long id) {
        actaAccidenteRepository.deleteById(id);
    }
}
