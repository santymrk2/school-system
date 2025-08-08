package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.AsignacionDocente;
import edu.ecep.base_app.mappers.AsignacionDocenteMapper;
import edu.ecep.base_app.dtos.AsignacionDocenteDTO;
import edu.ecep.base_app.repos.AsignacionDocenteRepository;
import edu.ecep.base_app.util.NotFoundException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AsignacionDocenteService {

    private final AsignacionDocenteRepository actaAccidenteRepository;
    private final AsignacionDocenteMapper actaAccidenteMapper;

    public AsignacionDocenteService(AsignacionDocenteRepository actaAccidenteRepository,
                                AsignacionDocenteMapper actaAccidenteMapper) {
        this.actaAccidenteRepository = actaAccidenteRepository;
        this.actaAccidenteMapper = actaAccidenteMapper;
    }

    public List<AsignacionDocenteDTO> findAll() {
        return actaAccidenteRepository.findAll(Sort.by("id")).stream()
                .map(actaAccidenteMapper::toDto)
                .toList();
    }

    public AsignacionDocenteDTO get(Long id) {
        return actaAccidenteRepository.findById(id)
                .map(actaAccidenteMapper::toDto)
                .orElseThrow(NotFoundException::new);
    }

    public Long create(AsignacionDocenteDTO dto) {
        AsignacionDocente entity = actaAccidenteMapper.toEntity(dto);
        return actaAccidenteRepository.save(entity).getId();
    }

    public void update(Long id, AsignacionDocenteDTO dto) {
        AsignacionDocente existing = actaAccidenteRepository.findById(id)
                .orElseThrow(NotFoundException::new);
        actaAccidenteMapper.updateEntityFromDto(dto, existing);
        actaAccidenteRepository.save(existing);
    }

    public void delete(Long id) {
        actaAccidenteRepository.deleteById(id);
    }
}

