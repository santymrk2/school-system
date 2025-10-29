package edu.ecep.base_app.comunicacion.application;

import edu.ecep.base_app.comunicacion.domain.Comunicado;
import edu.ecep.base_app.comunicacion.domain.enums.AlcanceComunicado;
import edu.ecep.base_app.comunicacion.infrastructure.mapper.ComunicadoMapper;
import edu.ecep.base_app.comunicacion.infrastructure.persistence.ComunicadoRepository;
import edu.ecep.base_app.comunicacion.presentation.dto.ComunicadoCreateDTO;
import edu.ecep.base_app.comunicacion.presentation.dto.ComunicadoDTO;
import edu.ecep.base_app.shared.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ComunicadoService {
    private final ComunicadoRepository repo;
    private final ComunicadoMapper mapper;

    public List<ComunicadoDTO> findAll() {
        return repo.findByActivoTrueOrderByDateCreatedDesc().stream()
                .map(mapper::toDto)
                .toList();
    }

    public ComunicadoDTO get(String id) {
        return repo.findByIdAndActivoTrue(id)
                .map(mapper::toDto)
                .orElseThrow(NotFoundException::new);
    }

    public String create(ComunicadoCreateDTO dto) {
        if (dto.getAlcance() == AlcanceComunicado.POR_SECCION && dto.getSeccionId() == null) {
            throw new IllegalArgumentException("Sección requerida");
        }
        if (dto.getAlcance() == AlcanceComunicado.POR_NIVEL && dto.getNivel() == null) {
            throw new IllegalArgumentException("Nivel requerido");
        }
        Comunicado entity = mapper.toEntity(dto);
        return repo.save(entity).getId();
    }

    public void update(String id, ComunicadoDTO dto) {
        Comunicado entity = repo.findByIdAndActivoTrue(id).orElseThrow(NotFoundException::new);
        mapper.update(entity, dto);
        repo.save(entity);
    }

    public void delete(String id) {
        Comunicado entity = repo.findByIdAndActivoTrue(id).orElseThrow(NotFoundException::new);
        entity.markDeleted();
        repo.save(entity);
    }
}
