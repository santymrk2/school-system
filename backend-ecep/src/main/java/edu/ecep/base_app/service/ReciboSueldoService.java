package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.ReciboSueldo;
import edu.ecep.base_app.dtos.ReciboSueldoCreateDTO;
import edu.ecep.base_app.dtos.ReciboSueldoDTO;
import edu.ecep.base_app.mappers.ReciboSueldoMapper;
import edu.ecep.base_app.repos.ReciboSueldoRepository;
import edu.ecep.base_app.util.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReciboSueldoService {
    private final ReciboSueldoRepository repo;
    private final ReciboSueldoMapper mapper;

    public List<ReciboSueldoDTO> findAll() {
        return repo.findAll(Sort.by("anio", "mes")).stream()
                .map(mapper::toDto)
                .toList();
    }

    public ReciboSueldoDTO get(Long id) {
        return repo.findById(id)
                .map(mapper::toDto)
                .orElseThrow(NotFoundException::new);
    }

    public Long create(ReciboSueldoCreateDTO dto) {
        return repo.save(mapper.toEntity(dto)).getId();
    }

    public void update(Long id, ReciboSueldoDTO dto) {
        ReciboSueldo entity = repo.findById(id).orElseThrow(NotFoundException::new);
        entity.setAnio(dto.getAnio());
        entity.setMes(dto.getMes());
        entity.setBruto(dto.getBruto());
        entity.setNeto(dto.getNeto());
        entity.setRecibiConforme(dto.isRecibiConforme());
        entity.setFechaConfirmacion(dto.getFechaConfirmacion());
        entity.setObsConfirmacion(dto.getObsConfirmacion());
        entity.setComprobanteArchivoId(dto.getComprobanteArchivoId());
        repo.save(entity);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new NotFoundException();
        }
        repo.deleteById(id);
    }
}
