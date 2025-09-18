package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.Trimestre;
import edu.ecep.base_app.dtos.TrimestreCreateDTO;
import edu.ecep.base_app.dtos.TrimestreDTO;
import edu.ecep.base_app.mappers.TrimestreMapper;
import edu.ecep.base_app.repos.TrimestreRepository;
import edu.ecep.base_app.util.NotFoundException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TrimestreService {

    private final TrimestreRepository repo;
    private final TrimestreMapper mapper;

    @Transactional(readOnly = true)
    public List<TrimestreDTO> list() {
        return repo.findAll().stream()
                .map(mapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TrimestreDTO> listByPeriodo(Long periodoEscolarId) {
        return repo.findByPeriodoEscolarIdOrderByOrdenAsc(periodoEscolarId).stream()
                .map(mapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public TrimestreDTO get(Long id) {
        Trimestre t = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Trimestre " + id + " no encontrado"));
        return mapper.toDto(t);
    }

    public Long create(TrimestreCreateDTO dto) {
        Trimestre entity = mapper.toEntity(dto);
        entity.setCerrado(false);
        return repo.save(entity).getId();
    }

    public void update(Long id, TrimestreDTO dto) {
        Trimestre entity = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Trimestre no encontrado"));
        mapper.updateEntityFromDto(dto, entity);
        repo.save(entity);
    }

    public void cerrar(Long id) {
        Trimestre entity = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Trimestre " + id + " no encontrado"));
        entity.setCerrado(true);
        repo.save(entity);
    }

    public void reabrir(Long id) {
        Trimestre entity = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Trimestre " + id + " no encontrado"));
        entity.setCerrado(false);
        repo.save(entity);
    }
}
