package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.PeriodoEscolar;
import edu.ecep.base_app.dtos.PeriodoEscolarCreateDTO;
import edu.ecep.base_app.dtos.PeriodoEscolarDTO;
import edu.ecep.base_app.mappers.PeriodoEscolarMapper;
import edu.ecep.base_app.repos.PeriodoEscolarRepository;
import edu.ecep.base_app.util.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class PeriodoEscolarService {

    private final PeriodoEscolarRepository repo;
    private final PeriodoEscolarMapper mapper;

    @Transactional(readOnly = true)
    public List<PeriodoEscolarDTO> findAll() {
        return repo.findAll(Sort.by("anio")).stream()
                .map(mapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public PeriodoEscolarDTO get(Long id) {
        return repo.findById(id)
                .map(mapper::toDto)
                .orElseThrow(() -> new NotFoundException("No encontrado"));
    }

    @Transactional(readOnly = true)
    public Optional<PeriodoEscolarDTO> findPeriodoAbierto() {
        return repo.findFirstByActivoTrueAndCerradoFalseOrderByAnioDesc()
                .map(mapper::toDto);
    }

    public Long create(PeriodoEscolarCreateDTO dto) {
        if (repo.existsByAnio(dto.getAnio())) {
            throw new IllegalArgumentException("Ya existe periodo para ese año");
        }
        if (repo.existsByActivoTrueAndCerradoFalse()) {
            throw new IllegalStateException("Debe cerrar el período vigente antes de crear uno nuevo");
        }
        PeriodoEscolar entity = mapper.toEntity(dto);
        entity.setCerrado(false);
        return repo.save(entity).getId();
    }

    public void cerrar(Long id) {
        PeriodoEscolar periodo = requireById(id);
        if (!periodo.isCerrado()) {
            periodo.setCerrado(true);
            repo.save(periodo);
        }
    }

    public void reabrir(Long id) {
        PeriodoEscolar periodo = requireById(id);
        if (periodo.isCerrado()) {
            periodo.setCerrado(false);
            repo.save(periodo);
        }
    }

    private PeriodoEscolar requireById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Periodo escolar no encontrado"));
    }
}
