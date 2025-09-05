package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.Aspirante;
import edu.ecep.base_app.dtos.AspiranteDTO;
import edu.ecep.base_app.mappers.AspiranteMapper;
import edu.ecep.base_app.repos.AspiranteFamiliarRepository;
import edu.ecep.base_app.repos.AspiranteRepository;
import edu.ecep.base_app.repos.SolicitudAdmisionRepository;
import edu.ecep.base_app.util.DuplicateDniException;
import edu.ecep.base_app.util.NotFoundException;
import edu.ecep.base_app.util.ReferencedException;
import edu.ecep.base_app.util.ReferencedWarning;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class AspiranteService {
    private final AspiranteRepository aspiranteRepository;
    private final SolicitudAdmisionRepository solicitudAdmisionRepository;
    private final AspiranteFamiliarRepository aspiranteFamiliarRepository;
    private final AspiranteMapper mapper;

    public AspiranteService(
            AspiranteRepository aspiranteRepository,
            SolicitudAdmisionRepository solicitudAdmisionRepository,
            AspiranteFamiliarRepository aspiranteFamiliarRepository,
            AspiranteMapper mapper
    ) {
        this.aspiranteRepository = aspiranteRepository;
        this.solicitudAdmisionRepository = solicitudAdmisionRepository;
        this.aspiranteFamiliarRepository = aspiranteFamiliarRepository;
        this.mapper = mapper;
    }

    public List<AspiranteDTO> findAll() {
        return aspiranteRepository.findAll(Sort.by("id")).stream().map(mapper::toDto).toList();
    }

    public AspiranteDTO get(Long id) {
        return aspiranteRepository.findById(id).map(mapper::toDto).orElseThrow(NotFoundException::new);
    }

    public Long create(AspiranteDTO dto) {
        return aspiranteRepository.save(mapper.toEntity(dto)).getId();
    }

    public Aspirante crear(AspiranteDTO dto) {
        if (aspiranteRepository.existsByDni(dto.getDni())) {
            throw new DuplicateDniException("El DNI %s ya está registrado".formatted(dto.getDni()));
        }
        Aspirante ent = mapper.toEntity(dto);
        return aspiranteRepository.save(ent);
    }

    public void update(Long id, AspiranteDTO dto) {
        Aspirante entity = aspiranteRepository.findById(id).orElseThrow(NotFoundException::new);
        mapper.update(entity, dto);   // <-- antes: mapper.updateEntityFromDto(dto, entity)
        aspiranteRepository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        ReferencedWarning warning = getReferencedWarning(id);
        if (warning != null) throw new ReferencedException(warning);
        if (!aspiranteRepository.existsById(id)) throw new NotFoundException("Aspirante no encontrado: " + id);
        aspiranteRepository.deleteById(id);
    }

    public ReferencedWarning getReferencedWarning(Long id) {
        if (solicitudAdmisionRepository.existsByAspiranteId(id)) {
            ReferencedWarning w = new ReferencedWarning("aspirante.referenciado.solicitudes");
            w.addParam(id);
            return w;
        }
        if (aspiranteFamiliarRepository.existsByAspiranteId(id)) {
            ReferencedWarning w = new ReferencedWarning("aspirante.referenciado.familiares");
            w.addParam(id);
            return w;
        }
        return null;
    }
}
