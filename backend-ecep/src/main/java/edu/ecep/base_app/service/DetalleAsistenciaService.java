package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.DetalleAsistencia;
import edu.ecep.base_app.domain.JornadaAsistencia;
import edu.ecep.base_app.repos.*;
import edu.ecep.base_app.dtos.*;
import edu.ecep.base_app.mappers.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.util.List;
import edu.ecep.base_app.repos.DetalleAsistenciaRepository;
import edu.ecep.base_app.repos.JornadaAsistenciaRepository;

@Service
@RequiredArgsConstructor
public class DetalleAsistenciaService {

    private final DetalleAsistenciaRepository repo;
    private final JornadaAsistenciaRepository jornadaRepo;
    private final DetalleAsistenciaMapper mapper;

    public List<DetalleAsistenciaDTO> findAll() {
        return repo.findAll().stream().map(mapper::toDto).toList();
    }

    @Transactional
    public Long marcar(DetalleAsistenciaCreateDTO dto) {
        // valida que la jornada exista
        JornadaAsistencia j = jornadaRepo.findById(dto.getJornadaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Jornada no encontrada"));

        // bloquea si el trimestre de esa jornada está cerrado
        if (j.getTrimestre() != null && j.getTrimestre().isCerrado()) {
            throw new IllegalArgumentException("El trimestre está cerrado");
        }

        // evita duplicados (único por jornada + matrícula)
        if (repo.existsByJornadaIdAndMatriculaId(dto.getJornadaId(), dto.getMatriculaId())) {
            throw new IllegalArgumentException("Ya hay registro para esa matrícula en esa jornada");
        }

        return repo.save(mapper.toEntity(dto)).getId();
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
