package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.Calificacion;
import edu.ecep.base_app.mappers.CalificacionMapper;
import edu.ecep.base_app.dtos.CalificacionDTO;
import edu.ecep.base_app.repos.CalificacionRepository;
import edu.ecep.base_app.util.NotFoundException;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service
public class CalificacionService {

    private final CalificacionRepository alumnoRepository;
    private final CalificacionMapper alumnoMapper;

    public CalificacionService(CalificacionRepository alumnoRepository,
                         CalificacionMapper alumnoMapper) {
        this.alumnoRepository = alumnoRepository;
        this.alumnoMapper = alumnoMapper;
    }

    public List<CalificacionDTO> findAll() {
        return alumnoRepository.findAll(Sort.by("id")).stream()
                .map(alumnoMapper::toDto)
                .toList();
    }

    public CalificacionDTO get(Long id) {
        return alumnoRepository.findById(id)
                .map(alumnoMapper::toDto)
                .orElseThrow(NotFoundException::new);
    }

    public Long create(CalificacionDTO dto) {
        Calificacion entity = alumnoMapper.toEntity(dto);
        return alumnoRepository.save(entity).getId();
    }

    public void update(Long id, CalificacionDTO dto) {
        Calificacion existing = alumnoRepository.findById(id)
                .orElseThrow(NotFoundException::new);
        alumnoMapper.updateEntityFromDto(dto, existing);
        alumnoRepository.save(existing);
    }

    public void delete(Long id) {
        alumnoRepository.deleteById(id);
    }
}
