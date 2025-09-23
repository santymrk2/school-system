package edu.ecep.base_app.gestionacademica.application;


import edu.ecep.base_app.gestionacademica.domain.AsignacionDocenteMateria;
import edu.ecep.base_app.gestionacademica.domain.enums.RolMateria;
import edu.ecep.base_app.gestionacademica.presentation.dto.AsignacionDocenteMateriaCreateDTO;
import edu.ecep.base_app.gestionacademica.presentation.dto.AsignacionDocenteMateriaDTO;
import edu.ecep.base_app.gestionacademica.infrastructure.mapper.AsignacionDocenteMateriaMapper;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.AsignacionDocenteMateriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AsignacionDocenteMateriaService {

    private final AsignacionDocenteMateriaRepository repo;
    private final AsignacionDocenteMateriaMapper mapper;

    @Transactional(readOnly = true)
    public List<AsignacionDocenteMateriaDTO> findAll() {
        return repo.findAll().stream()
                .map(mapper::toDto)
                .toList();
    }

    @Transactional
    public Long create(AsignacionDocenteMateriaCreateDTO dto) {
        LocalDate desde = dto.getVigenciaDesde();
        if (desde == null) {
            desde = LocalDate.now();
        }

        LocalDate hasta = dto.getVigenciaHasta();
        if (dto.getRol() == RolMateria.SUPLENTE) {
            if (hasta == null) {
                throw new IllegalArgumentException("La suplencia debe tener una fecha de finalización.");
            }
            if (hasta.isBefore(desde)) {
                throw new IllegalArgumentException("La fecha hasta no puede ser anterior a la fecha desde.");
            }
        } else {
            hasta = null;
            LocalDate cierre = desde.minusDays(1);
            for (AsignacionDocenteMateria vigente : repo.findTitularesVigentesEn(dto.getSeccionMateriaId(), desde)) {
                vigente.setVigenciaHasta(cierre);
                repo.save(vigente);
            }
        }

        dto.setVigenciaDesde(desde);
        dto.setVigenciaHasta(hasta);

        LocalDate hastaValidacion = hasta == null ? LocalDate.of(9999, 12, 31) : hasta;
        if (dto.getRol() == RolMateria.TITULAR
                && repo.hasTitularOverlap(dto.getSeccionMateriaId(), desde, hastaValidacion, null)) {
            throw new IllegalArgumentException("Ya hay un titular vigente en ese rango");
        }

        AsignacionDocenteMateria entity = mapper.toEntity(dto);
        entity.setVigenciaHasta(hasta);
        entity.setVigenciaDesde(desde);
        return repo.save(entity).getId();
    }
}
