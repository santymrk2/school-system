package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.*;
import edu.ecep.base_app.dtos.*;
import edu.ecep.base_app.mappers.*;
import edu.ecep.base_app.repos.*;
import edu.ecep.base_app.util.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TrimestreService {

    private final TrimestreRepository repo;
    private final TrimestreMapper mapper;

    @Transactional(readOnly = true)
    public List<TrimestreDTO> list() {
        return repo.findAll().stream().map(mapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public TrimestreDTO get(Long id) {
        Trimestre t = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Trimestre " + id + " no encontrado"));
        return mapper.toDto(t);
    }

    public Long create(TrimestreCreateDTO dto) {
        Trimestre e = mapper.toEntity(dto);
        e.setCerrado(false);
        return repo.save(e).getId();
    }

    public void update(Long id, TrimestreDTO dto) {
        Trimestre t = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Trimestre no encontrado"));

        // Si necesitás tocar PeriodoEscolar relación, hacelo ANTES del merge
        // if (dto.getPeriodoEscolarId() != null) {
        //   t.setPeriodoEscolar(periodoRepo.getReferenceById(dto.getPeriodoEscolarId()));
        // }

        mapper.updateEntityFromDto(dto, t);
        repo.save(t);
    }

    public void cerrar(Long id) {
        Trimestre e = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Trimestre " + id + " no encontrado"));
        e.setCerrado(true);
        repo.save(e);
    }

    public void reabrir(Long id) {
        Trimestre e = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Trimestre " + id + " no encontrado"));
        e.setCerrado(false);
        repo.save(e);
    }
}
