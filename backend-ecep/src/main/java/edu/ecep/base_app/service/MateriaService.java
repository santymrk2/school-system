package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.Materia;
import edu.ecep.base_app.mappers.MateriaMapper;
import edu.ecep.base_app.dtos.MateriaDTO;
import edu.ecep.base_app.repos.*;
import edu.ecep.base_app.util.NotFoundException;

import java.util.List;

import edu.ecep.base_app.util.ReferencedException;
import edu.ecep.base_app.util.ReferencedWarning;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service
public class MateriaService {
    private final MateriaRepository materiaRepository;
    private final EvaluacionRepository evaluacionRepository;
    private final AsignacionDocenteRepository asignacionDocenteRepository;
    private final MateriaMapper mapper;

    public MateriaService(
            MateriaRepository materiaRepository,
            EvaluacionRepository evaluacionRepository,
            AsignacionDocenteRepository asignacionDocenteRepository,
            MateriaMapper mapper
    ) {
        this.materiaRepository = materiaRepository;
        this.evaluacionRepository = evaluacionRepository;
        this.asignacionDocenteRepository = asignacionDocenteRepository;
        this.mapper = mapper;
    }

    public List<MateriaDTO> findAll() {
        return materiaRepository.findAll(Sort.by("id")).stream().map(mapper::toDto).toList();
    }

    public MateriaDTO get(Long id) {
        return materiaRepository.findById(id).map(mapper::toDto).orElseThrow(NotFoundException::new);
    }

    public Long create(MateriaDTO dto) {
        return materiaRepository.save(mapper.toEntity(dto)).getId();
    }

    public void update(Long id, MateriaDTO dto) {
        Materia entity = materiaRepository.findById(id).orElseThrow(NotFoundException::new);
        mapper.updateEntityFromDto(dto, entity);
        materiaRepository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        ReferencedWarning warning = getReferencedWarning(id);
        if (warning != null) throw new ReferencedException(warning);
        if (!materiaRepository.existsById(id)) throw new NotFoundException("Materia no encontrada: " + id);
        materiaRepository.deleteById(id);
    }

    public ReferencedWarning getReferencedWarning(Long id) {
        if (evaluacionRepository.existsByMateriaId(id)) {
            ReferencedWarning w = new ReferencedWarning("materia.referenciada.evaluaciones");
            w.addParam(id);
            return w;
        }
        if (asignacionDocenteRepository.existsByMateriaId(id)) {
            ReferencedWarning w = new ReferencedWarning("materia.referenciada.asignaciones");
            w.addParam(id);
            return w;
        }
        return null;
    }

}
