package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.AsistenciaDia;
import edu.ecep.base_app.mappers.AsistenciaDiaMapper;
import edu.ecep.base_app.dtos.AsistenciaDiaDTO;
import edu.ecep.base_app.repos.AsistenciaDiaRepository;
import edu.ecep.base_app.util.NotFoundException;

import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service
public class AsistenciaDiaService {

    private final AsistenciaDiaRepository asistenciaDiaRepository;
    private final AsistenciaDiaMapper asistenciaDiaMapper;

    public AsistenciaDiaService(AsistenciaDiaRepository asistenciaDiaRepository,
                         AsistenciaDiaMapper asistenciaDiaMapper) {
        this.asistenciaDiaRepository = asistenciaDiaRepository;
        this.asistenciaDiaMapper = asistenciaDiaMapper;
    }

    public List<AsistenciaDiaDTO> findAll() {
        return asistenciaDiaRepository.findAll(Sort.by("id")).stream()
                .map(asistenciaDiaMapper::toDto)
                .toList();
    }

    public AsistenciaDiaDTO get(Long id) {
        return asistenciaDiaRepository.findById(id)
                .map(asistenciaDiaMapper::toDto)
                .orElseThrow(NotFoundException::new);
    }

    public Long create(AsistenciaDiaDTO dto) {
        AsistenciaDia entity = asistenciaDiaMapper.toEntity(dto);
        return asistenciaDiaRepository.save(entity).getId();
    }

    public void update(Long id, AsistenciaDiaDTO dto) {
        AsistenciaDia existing = asistenciaDiaRepository.findById(id)
                .orElseThrow(NotFoundException::new);
        asistenciaDiaMapper.updateEntityFromDto(dto, existing);
        asistenciaDiaRepository.save(existing);
    }

    public void delete(Long id) {
        asistenciaDiaRepository.deleteById(id);
    }
}
