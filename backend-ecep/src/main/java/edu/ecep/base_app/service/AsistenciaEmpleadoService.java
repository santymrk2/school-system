package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.AsistenciaEmpleados;
import edu.ecep.base_app.dtos.AsistenciaEmpleadoDTO;
import edu.ecep.base_app.mappers.AsistenciaEmpleadoMapper;
import edu.ecep.base_app.repos.AsistenciaEmpleadoRepository;
import edu.ecep.base_app.util.NotFoundException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AsistenciaEmpleadoService {

    private final AsistenciaEmpleadoRepository asistenciaDiaRepository;
    private final AsistenciaEmpleadoMapper asistenciaDiaMapper;

    public AsistenciaEmpleadoService(AsistenciaEmpleadoRepository asistenciaDiaRepository,
                                     AsistenciaEmpleadoMapper asistenciaDiaMapper) {
        this.asistenciaDiaRepository = asistenciaDiaRepository;
        this.asistenciaDiaMapper = asistenciaDiaMapper;
    }

    public List<AsistenciaEmpleadoDTO> findAll() {
        return asistenciaDiaRepository.findAll(Sort.by("id")).stream()
                .map(asistenciaDiaMapper::toDto)
                .toList();
    }

    public AsistenciaEmpleadoDTO get(Long id) {
        return asistenciaDiaRepository.findById(id)
                .map(asistenciaDiaMapper::toDto)
                .orElseThrow(NotFoundException::new);
    }

    public Long create(AsistenciaEmpleadoDTO dto) {
        AsistenciaEmpleados entity = asistenciaDiaMapper.toEntity(dto);
        return asistenciaDiaRepository.save(entity).getId();
    }

    public void update(Long id, AsistenciaEmpleadoDTO dto) {
        AsistenciaEmpleados existing = asistenciaDiaRepository.findById(id)
                .orElseThrow(NotFoundException::new);
        asistenciaDiaMapper.updateEntityFromDto(dto, existing);
        asistenciaDiaRepository.save(existing);
    }

    public void delete(Long id) {
        asistenciaDiaRepository.deleteById(id);
    }
}