package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.DetalleAsistencia;
import edu.ecep.base_app.domain.JornadaAsistencia;
import edu.ecep.base_app.domain.TrimestreEstado;
import edu.ecep.base_app.dtos.DetalleAsistenciaCreateDTO;
import edu.ecep.base_app.dtos.DetalleAsistenciaDTO;
import edu.ecep.base_app.dtos.DetalleAsistenciaUpdateDTO;
import edu.ecep.base_app.mappers.DetalleAsistenciaMapper;
import edu.ecep.base_app.repos.DetalleAsistenciaRepository;
import edu.ecep.base_app.repos.JornadaAsistenciaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DetalleAsistenciaService {

    private final DetalleAsistenciaRepository repo;
    private final JornadaAsistenciaRepository jornadaRepo;
    private final DetalleAsistenciaMapper mapper;

    public List<DetalleAsistenciaDTO> findAll() {
        return repo.findAll().stream().map(mapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public DetalleAsistenciaDTO get(Long id) {
        return repo.findById(id)
                .map(mapper::toDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Detalle no encontrado"));
    }

    @Transactional
    public Long marcar(DetalleAsistenciaCreateDTO dto) {
        JornadaAsistencia j = jornadaRepo.findById(dto.getJornadaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Jornada no encontrada"));

        if (j.getTrimestre() != null && j.getTrimestre().getEstado() != TrimestreEstado.ACTIVO) {
            throw new IllegalArgumentException("El trimestre no está activo");
        }

        if (repo.existsByJornadaIdAndMatriculaId(dto.getJornadaId(), dto.getMatriculaId())) {
            throw new IllegalArgumentException("Ya hay registro para esa matrícula en esa jornada");
        }

        return repo.save(mapper.toEntity(dto)).getId();
    }

    @Transactional
    public void actualizarParcial(Long id, DetalleAsistenciaUpdateDTO dto) {
        DetalleAsistencia entity = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Detalle no encontrado"));
        entity.setEstado(dto.getEstado());
        entity.setObs(dto.getObservacion());
        repo.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Detalle no encontrado");
        }
        repo.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<DetalleAsistenciaDTO> search(Long jornadaId, Long matriculaId,
                                             LocalDate from, LocalDate to) {
        List<DetalleAsistencia> res;
        if (jornadaId != null) {
            res = repo.findByJornadaId(jornadaId);
        } else if (matriculaId != null && from != null && to != null) {
            res = repo.findByMatriculaIdAndJornada_FechaBetween(matriculaId, from, to);
        } else {
            res = repo.findAll();
        }
        return res.stream().map(mapper::toDto).toList();
    }
}
