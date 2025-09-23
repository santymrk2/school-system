package edu.ecep.base_app.finanzas.application;

import edu.ecep.base_app.finanzas.presentation.dto.EmisionCuotaCreateDTO;
import edu.ecep.base_app.finanzas.presentation.dto.EmisionCuotaDTO;
import edu.ecep.base_app.finanzas.infrastructure.mapper.EmisionCuotaMapper;
import edu.ecep.base_app.finanzas.infrastructure.persistence.EmisionCuotaRepository;
import edu.ecep.base_app.shared.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmisionCuotaService {
    private final EmisionCuotaRepository repo;
    private final EmisionCuotaMapper mapper;

    public List<EmisionCuotaDTO> findAll() {
        return repo.findAll(Sort.by("fechaEmision").descending())
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    public EmisionCuotaDTO get(Long id) {
        return repo.findById(id)
                .map(mapper::toDto)
                .orElseThrow(() -> new NotFoundException("No encontrado"));
    }

    public Long create(EmisionCuotaCreateDTO dto) {
        return repo.save(mapper.toEntity(dto)).getId();
    }

    public void update(Long id, EmisionCuotaCreateDTO dto) {
        var entity = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("No encontrado"));
        entity.setAnio(dto.getAnio());
        entity.setMes(dto.getMes());
        entity.setConcepto(dto.getConcepto());
        entity.setSubconcepto(dto.getSubconcepto());
        entity.setPorcentajeRecargoDefault(dto.getPorcentajeRecargoDefault());
        entity.setCriterios(dto.getCriterios());
        entity.setCreadoPor(dto.getCreadoPor());
        repo.save(entity);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new NotFoundException("No encontrado");
        }
        repo.deleteById(id);
    }
}
