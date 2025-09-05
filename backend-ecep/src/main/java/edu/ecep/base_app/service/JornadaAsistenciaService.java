package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.Trimestre;
import edu.ecep.base_app.repos.*;
import edu.ecep.base_app.dtos.*;
import edu.ecep.base_app.mappers.*;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class JornadaAsistenciaService {

    private final JornadaAsistenciaRepository repo;
    private final JornadaAsistenciaMapper mapper;
    private final TrimestreRepository trimRepo;

    public List<JornadaAsistenciaDTO> findAll() {
        return repo.findAll(Sort.by("fecha").descending())
                .stream().map(mapper::toDto).toList();
    }
    @Transactional(readOnly = true)
    public Optional<JornadaAsistenciaDTO> findBySeccionAndFecha(Long seccionId, LocalDate fecha) {
        return repo.findBySeccionIdAndFecha(seccionId, fecha).map(mapper::toDto);
    }

    public Long abrir(JornadaAsistenciaCreateDTO dto) {
        // no duplicar jornadas por sección+fecha
        if (repo.existsBySeccionIdAndFecha(dto.getSeccionId(), dto.getFecha())) {
            throw new IllegalArgumentException("Ya existe una jornada para esa sección y fecha");
        }
        // validar trimestre y que no esté cerrado
        Trimestre tri = trimRepo.findById(dto.getTrimestreId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trimestre no encontrado"));
        if (Boolean.TRUE.equals(tri.isCerrado())) {
            throw new IllegalArgumentException("El trimestre está cerrado");
        }
        return repo.save(mapper.toEntity(dto)).getId();
    }


    @Transactional(readOnly = true)
    public JornadaAsistenciaDTO get(Long id) {
        var j = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Jornada " + id + " no encontrada"));
        return mapper.toDto(j);
    }
    public List<JornadaAsistenciaDTO> findBySeccion(Long seccionId) {
        return repo.findBySeccionId(seccionId).stream().map(mapper::toDto).toList();
    }

    public List<JornadaAsistenciaDTO> findBySeccionBetween(Long seccionId, LocalDate from, LocalDate to) {
        return repo.findBySeccionIdAndFechaBetween(seccionId, from, to)
                .stream().map(mapper::toDto).toList();
    }

    public List<JornadaAsistenciaDTO> findByTrimestre(Long trimestreId) {
        return repo.findByTrimestreId(trimestreId).stream().map(mapper::toDto).toList();
    }
}
