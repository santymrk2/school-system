package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.*;
import edu.ecep.base_app.mappers.SeccionMapper;

import edu.ecep.base_app.dtos.SeccionDTO;
import edu.ecep.base_app.repos.*;
import edu.ecep.base_app.util.NotFoundException;
import edu.ecep.base_app.util.ReferencedException;
import edu.ecep.base_app.util.ReferencedWarning;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class SeccionService {
    private final SeccionRepository seccionRepository;
    private final MatriculaRepository matriculaRepository;
    private final EvaluacionRepository evaluacionRepository;
    private final AsignacionDocenteRepository asignacionDocenteRepository;
    private final AsistenciaDiaRepository asistenciaDiaRepository;
    private final CuotaRepository cuotaRepository;
    private final SeccionMapper mapper;

    public SeccionService(
            SeccionRepository seccionRepository,
            MatriculaRepository matriculaRepository,
            EvaluacionRepository evaluacionRepository,
            AsignacionDocenteRepository asignacionDocenteRepository,
            AsistenciaDiaRepository asistenciaDiaRepository,
            CuotaRepository cuotaRepository,
            SeccionMapper mapper
    ) {
        this.seccionRepository = seccionRepository;
        this.matriculaRepository = matriculaRepository;
        this.evaluacionRepository = evaluacionRepository;
        this.asignacionDocenteRepository = asignacionDocenteRepository;
        this.asistenciaDiaRepository = asistenciaDiaRepository;
        this.cuotaRepository = cuotaRepository;
        this.mapper = mapper;

    }

    public List<SeccionDTO> findAll() {
        return seccionRepository.findAll(Sort.by("id")).stream().map(mapper::toDto).toList();
    }

    public SeccionDTO get(Long id) {
        return seccionRepository.findById(id).map(mapper::toDto).orElseThrow(NotFoundException::new);
    }

    public Long create(SeccionDTO dto) {
        return seccionRepository.save(mapper.toEntity(dto)).getId();
    }

    public void update(Long id, SeccionDTO dto) {
        Seccion entity = seccionRepository.findById(id).orElseThrow(NotFoundException::new);
        mapper.updateEntityFromDto(dto, entity);
        seccionRepository.save(entity);
    }


    @Transactional
    public void delete(Long id) {
        ReferencedWarning warning = getReferencedWarning(id);
        if (warning != null) throw new ReferencedException(warning);
        if (!seccionRepository.existsById(id)) throw new NotFoundException("Sección no encontrada: " + id);
        seccionRepository.deleteById(id);
    }

    public ReferencedWarning getReferencedWarning(Long id) {
        if (matriculaRepository.existsBySeccionId(id)) {
            ReferencedWarning w = new ReferencedWarning("seccion.referenciada.matriculas");
            w.addParam(id);
            return w;
        }
        if (evaluacionRepository.existsBySeccionId(id)) {
            ReferencedWarning w = new ReferencedWarning("seccion.referenciada.evaluaciones");
            w.addParam(id);
            return w;
        }
        if (asignacionDocenteRepository.existsBySeccionId(id)) {
            ReferencedWarning w = new ReferencedWarning("seccion.referenciada.asignaciones");
            w.addParam(id);
            return w;
        }
        if (asistenciaDiaRepository.existsBySeccionId(id)) {
            ReferencedWarning w = new ReferencedWarning("seccion.referenciada.asistencias");
            w.addParam(id);
            return w;
        }
        if (cuotaRepository.existsBySeccionId(id)) {
            ReferencedWarning w = new ReferencedWarning("seccion.referenciada.cuotas");
            w.addParam(id);
            return w;
        }
        return null;
    }

}
