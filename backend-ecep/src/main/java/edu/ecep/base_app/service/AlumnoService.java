package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.*;
import edu.ecep.base_app.dtos.AlumnoDTO;
import edu.ecep.base_app.mappers.AlumnoMapper;
import edu.ecep.base_app.repos.AlumnoFamiliarRepository;
import edu.ecep.base_app.repos.AlumnoRepository;
import edu.ecep.base_app.repos.MatriculaRepository;
import edu.ecep.base_app.util.NotFoundException;

import java.util.List;

import edu.ecep.base_app.util.ReferencedException;
import edu.ecep.base_app.util.ReferencedWarning;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


import edu.ecep.base_app.domain.Alumno;
import lombok.RequiredArgsConstructor;


@Service @RequiredArgsConstructor
public class AlumnoService {

    private final AlumnoRepository alumnoRepository;
    private final MatriculaRepository matriculaRepository;
    private final AlumnoFamiliarRepository alumnoFamiliarRepository;
    private final AlumnoMapper alumnoMapper;

    public List<AlumnoDTO> findAll() {
        return alumnoRepository.findAll(Sort.by("id"))
                .stream().map(alumnoMapper::toDto).toList();
    }

    public AlumnoDTO get(Long id) {
        return alumnoRepository.findById(id)
                .map(alumnoMapper::toDto)
                .orElseThrow(() -> new NotFoundException("Alumno no encontrado"));
    }

    public Long create(AlumnoDTO dto) {
        Alumno entity = alumnoMapper.toEntity(dto);
        return alumnoRepository.save(entity).getId();
    }

    public void update(Long id, AlumnoDTO dto) {
        Alumno existing = alumnoRepository.findById(id).orElseThrow(() -> new NotFoundException("Alumno no encontrado"));
        alumnoMapper.update(existing, dto);
        alumnoRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        ReferencedWarning warning = getReferencedWarning(id);
        if (warning != null) throw new ReferencedException(warning);
        if (!alumnoRepository.existsById(id)) {
            throw new NotFoundException("Alumno no encontrado: " + id);
        }
        alumnoRepository.deleteById(id);
    }

    public ReferencedWarning getReferencedWarning(Long id) {
        // ⚠️ requiere repo: boolean existsByAlumnoId(Long alumnoId)
        if (matriculaRepository.existsByAlumnoId(id)) {
            ReferencedWarning w = new ReferencedWarning("alumno.referenciado.matriculas");
            w.addParam(id);
            return w;
        }
        // ⚠️ requiere repo: boolean existsByAlumnoId(Long alumnoId)
        if (alumnoFamiliarRepository.existsByAlumnoId(id)) {
            ReferencedWarning w = new ReferencedWarning("alumno.referenciado.familiares");
            w.addParam(id);
            return w;
        }
        return null;
    }
}
