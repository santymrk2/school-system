package edu.ecep.base_app.gestionacademica.application;

import edu.ecep.base_app.gestionacademica.domain.AsignacionDocenteSeccion;
import edu.ecep.base_app.gestionacademica.domain.enums.RolSeccion;
import edu.ecep.base_app.gestionacademica.presentation.dto.AsignacionDocenteSeccionCreateDTO;
import edu.ecep.base_app.gestionacademica.presentation.dto.AsignacionDocenteSeccionDTO;
import edu.ecep.base_app.gestionacademica.infrastructure.mapper.AsignacionDocenteSeccionMapper;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.AsignacionDocenteSeccionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AsignacionDocenteSeccionService {

    private final AsignacionDocenteSeccionRepository repo;
    private final AsignacionDocenteSeccionMapper mapper;

    @Transactional(readOnly = true)
    public List<AsignacionDocenteSeccionDTO> findAll() {
        return repo.findAll().stream()
                .map(mapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AsignacionDocenteSeccionDTO> findBySeccion(Long seccionId) {
        return repo.findBySeccion_Id(seccionId).stream()
                .map(mapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AsignacionDocenteSeccionDTO> findVigentesByEmpleado(Long empleadoId, LocalDate fecha) {
        LocalDate targetDate = fecha != null ? fecha : LocalDate.now();
        return repo.findVigentesByEmpleado(empleadoId, targetDate).stream()
                .map(mapper::toDto)
                .toList();
    }

    @Transactional
    public Long create(AsignacionDocenteSeccionCreateDTO dto) {
        LocalDate desde = dto.getVigenciaDesde();
        if (desde == null) {
            desde = LocalDate.now();
        }

        RolSeccion rol = dto.getRol();
        LocalDate hasta = dto.getVigenciaHasta();

        if (rol == RolSeccion.SUPLENTE) {
            if (hasta == null) {
                throw new IllegalArgumentException("La suplencia debe tener una fecha de finalización.");
            }
            if (hasta.isBefore(desde)) {
                throw new IllegalArgumentException("La fecha hasta no puede ser anterior a la fecha desde.");
            }
        } else if (rol == RolSeccion.MAESTRO_TITULAR) {
            hasta = null;
            LocalDate cierre = desde.minusDays(1);
            for (AsignacionDocenteSeccion vigente : repo.findTitularesVigentesEn(dto.getSeccionId(), desde)) {
                vigente.setVigenciaHasta(cierre);
                repo.save(vigente);
            }
        }

        dto.setVigenciaDesde(desde);
        dto.setVigenciaHasta(hasta);

        LocalDate hastaValidacion = hasta == null ? LocalDate.of(9999, 12, 31) : hasta;
        if (rol == RolSeccion.MAESTRO_TITULAR
                && repo.hasTitularOverlap(dto.getSeccionId(), desde, hastaValidacion, null)) {
            throw new IllegalArgumentException("Ya hay un titular vigente en ese rango");
        }

        AsignacionDocenteSeccion entity = mapper.toEntity(dto);
        entity.setVigenciaDesde(desde);
        entity.setVigenciaHasta(hasta);
        return repo.save(entity).getId();
    }

    @Transactional
    public void delete(Long id) {
        repo.deleteById(id);
    }
}
