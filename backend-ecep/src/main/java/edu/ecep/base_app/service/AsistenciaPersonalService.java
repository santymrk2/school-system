package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.AsistenciaPersonal;
import edu.ecep.base_app.dtos.AsistenciaPersonalDTO;
import edu.ecep.base_app.mappers.AsistenciaPersonalMapper;
import edu.ecep.base_app.repos.AsistenciaPersonalRepository;
import edu.ecep.base_app.util.NotFoundException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AsistenciaPersonalService {

    private final AsistenciaPersonalRepository asistenciaDiaRepository;
    private final AsistenciaPersonalMapper asistenciaDiaMapper;

    public AsistenciaPersonalService(AsistenciaPersonalRepository asistenciaDiaRepository,
                                AsistenciaPersonalMapper asistenciaDiaMapper) {
        this.asistenciaDiaRepository = asistenciaDiaRepository;
        this.asistenciaDiaMapper = asistenciaDiaMapper;
    }

    public List<AsistenciaPersonalDTO> findAll() {
        return asistenciaDiaRepository.findAll(Sort.by("id")).stream()
                .map(asistenciaDiaMapper::toDto)
                .toList();
    }

    public AsistenciaPersonalDTO get(Long id) {
        return asistenciaDiaRepository.findById(id)
                .map(asistenciaDiaMapper::toDto)
                .orElseThrow(NotFoundException::new);
    }

    public Long create(AsistenciaPersonalDTO dto) {
        AsistenciaPersonal entity = asistenciaDiaMapper.toEntity(dto);
        return asistenciaDiaRepository.save(entity).getId();
    }

    public void update(Long id, AsistenciaPersonalDTO dto) {
        AsistenciaPersonal existing = asistenciaDiaRepository.findById(id)
                .orElseThrow(NotFoundException::new);
        asistenciaDiaMapper.updateEntityFromDto(dto, existing);
        asistenciaDiaRepository.save(existing);
    }

    public void delete(Long id) {
        asistenciaDiaRepository.deleteById(id);
    }
}