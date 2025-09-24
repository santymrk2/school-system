package edu.ecep.base_app.identidad.application;

import edu.ecep.base_app.identidad.domain.Empleado;
import edu.ecep.base_app.identidad.domain.Persona;
import edu.ecep.base_app.identidad.domain.enums.RolEmpleado;
import edu.ecep.base_app.identidad.presentation.dto.EmpleadoCreateDTO;
import edu.ecep.base_app.identidad.presentation.dto.EmpleadoDTO;
import edu.ecep.base_app.identidad.presentation.dto.EmpleadoUpdateDTO;
import edu.ecep.base_app.identidad.infrastructure.mapper.EmpleadoMapper;
import edu.ecep.base_app.asistencias.infrastructure.persistence.AsistenciaEmpleadoRepository;
import edu.ecep.base_app.finanzas.infrastructure.persistence.ReciboSueldoRepository;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.AsignacionDocenteMateriaRepository;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.AsignacionDocenteSeccionRepository;
import edu.ecep.base_app.identidad.infrastructure.persistence.EmpleadoRepository;
import edu.ecep.base_app.identidad.infrastructure.persistence.LicenciaRepository;
import edu.ecep.base_app.identidad.infrastructure.persistence.PersonaRepository;
import edu.ecep.base_app.shared.exception.NotFoundException;
import edu.ecep.base_app.shared.exception.ReferencedException;
import edu.ecep.base_app.shared.exception.ReferencedWarning;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class EmpleadoService {

    private static final Pattern LEGAJO_PATTERN = Pattern.compile("^[A-Z0-9-]{4,20}$");

    private final EmpleadoRepository repo;
    private final PersonaRepository personaRepository;
    private final AsignacionDocenteSeccionRepository adsRepo;
    private final AsignacionDocenteMateriaRepository admRepo;
    private final ReciboSueldoRepository reciboRepo;
    private final LicenciaRepository licenciaRepo;
    private final AsistenciaEmpleadoRepository asistenciaRepo;
    private final EmpleadoMapper mapper;

    public Page<EmpleadoDTO> findAll(String search,
                                     RolEmpleado rolEmpleado,
                                     Pageable pageable) {
        Pageable effectivePageable = ensureSort(pageable);
        Page<Empleado> empleados;
        if (StringUtils.hasText(search) || rolEmpleado != null) {
            empleados = repo.search(search, rolEmpleado, effectivePageable);
        } else {
            empleados = repo.findAll(effectivePageable);
        }
        return empleados.map(mapper::toDto);
    }

    private Pageable ensureSort(Pageable pageable) {
        Sort defaultSort = Sort.by("id");
        if (pageable == null) {
            return PageRequest.of(0, 20, defaultSort);
        }
        if (pageable.getSort().isUnsorted()) {
            int size = pageable.getPageSize();
            if (size <= 0) {
                size = 20;
            }
            return PageRequest.of(pageable.getPageNumber(), size, defaultSort);
        }
        return pageable;
    }

    public EmpleadoDTO get(Long id) {
        return repo.findById(id)
                .map(mapper::toDto)
                .orElseThrow(() -> new NotFoundException("Empleado no encontrado"));
    }

    @Transactional
    public EmpleadoDTO create(EmpleadoCreateDTO dto) {
        if (dto.getPersonaId() == null) {
            throw new IllegalArgumentException("Debe enviar personaId");
        }
        if (dto.getRolEmpleado() == null) {
            throw new IllegalArgumentException("Debe enviar rolEmpleado");
        }

        // 1) Persona existente
        Persona persona = personaRepository.findById(dto.getPersonaId())
                .orElseThrow(() -> new NotFoundException("Persona no encontrada"));

        // 2) Evitar duplicado: una persona no puede tener dos Empleados
        if (repo.existsByPersonaId(persona.getId())) {
            throw new IllegalArgumentException("La persona ya tiene rol Empleado");
        }

        // 3) Validar legajo
        String legajo = requireValidLegajo(dto.getLegajo());
        ensureLegajoDisponible(legajo, null);

        // 4) Crear empleado (si usás @MapsId, el id del empleado será el de persona)
        Empleado p = new Empleado();
        p.setPersona(persona);
        p.setRolEmpleado(dto.getRolEmpleado());
        p.setCuil(dto.getCuil());
        p.setLegajo(legajo);
        p.setCondicionLaboral(dto.getCondicionLaboral());
        p.setCargo(dto.getCargo());
        p.setSituacionActual(dto.getSituacionActual());
        p.setFechaIngreso(dto.getFechaIngreso());
        p.setAntecedentesLaborales(dto.getAntecedentesLaborales());
        p.setObservacionesGenerales(dto.getObservacionesGenerales());

        p = repo.save(p);
        return mapper.toDto(p);
    }

    @Transactional
    public EmpleadoDTO update(Long id, EmpleadoUpdateDTO dto) {
        Empleado p = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Empleado no encontrado"));

        // Con @MapsId NO permitimos cambiar la persona (cambia la PK).
        if (dto.getPersonaId() != null) {
            Long currentPersonaId = (p.getPersona() != null) ? p.getPersona().getId() : null;
            if (!dto.getPersonaId().equals(currentPersonaId)) {
                throw new IllegalArgumentException(
                        "No se puede cambiar la persona de un Empleado. " +
                                "Elimine el registro y cree uno nuevo con el personaId correcto."
                );
            }
            // Si es igual, no hacemos nada (idempotente).
        }

        // Update laboral (solo campos no nulos)
        if (dto.getRolEmpleado() != null)       p.setRolEmpleado(dto.getRolEmpleado());
        if (dto.getCuil() != null)              p.setCuil(dto.getCuil());
        if (dto.getLegajo() != null) {
            String legajo = requireValidLegajo(dto.getLegajo());
            String currentLegajo = p.getLegajo();
            if (currentLegajo == null || !currentLegajo.equalsIgnoreCase(legajo)) {
                ensureLegajoDisponible(legajo, p.getId());
            }
            p.setLegajo(legajo);
        }
        if (dto.getCondicionLaboral() != null)  p.setCondicionLaboral(dto.getCondicionLaboral());
        if (dto.getCargo() != null)             p.setCargo(dto.getCargo());
        if (dto.getSituacionActual() != null)   p.setSituacionActual(dto.getSituacionActual());
        if (dto.getFechaIngreso() != null)      p.setFechaIngreso(dto.getFechaIngreso());
        if (dto.getAntecedentesLaborales() != null) p.setAntecedentesLaborales(dto.getAntecedentesLaborales());
        if (dto.getObservacionesGenerales() != null) p.setObservacionesGenerales(dto.getObservacionesGenerales());

        // Hibernate hace flush al salir de @Transactional
        return mapper.toDto(p);
    }

    @Transactional
    public void delete(Long id) {
        ReferencedWarning w = getReferencedWarning(id);
        if (w != null) throw new ReferencedException(w);
        if (!repo.existsById(id)) throw new NotFoundException("Empleado no encontrado: " + id);
        repo.deleteById(id);
    }

    public ReferencedWarning getReferencedWarning(Long id) {
        if (licenciaRepo.existsByEmpleadoId(id))
            return new ReferencedWarning("empleado.referenciado.licencias");
        if (reciboRepo.existsByEmpleadoId(id))
            return new ReferencedWarning("empleado.referenciado.recibos");
        if (asistenciaRepo.existsByEmpleadoId(id))
            return new ReferencedWarning("empleado.referenciado.asistencia");
        // (Opcional) validar asignaciones si tenés estos métodos:
        // if (adsRepo.existsByEmpleadoId(id) || admRepo.existsByEmpleadoId(id)) ...
        return null;
    }

    private String requireValidLegajo(String legajo) {
        if (!StringUtils.hasText(legajo)) {
            throw new IllegalArgumentException("Debe enviar legajo");
        }
        String normalized = normalizeLegajo(legajo);
        if (!LEGAJO_PATTERN.matcher(normalized).matches()) {
            throw new IllegalArgumentException(
                    "El legajo debe tener entre 4 y 20 caracteres alfanuméricos y puede incluir guiones"
            );
        }
        return normalized;
    }

    private void ensureLegajoDisponible(String legajo, Long excludeId) {
        repo.findByLegajoIgnoreCase(legajo)
                .ifPresent(existing -> {
                    if (excludeId == null || !existing.getId().equals(excludeId)) {
                        throw new IllegalArgumentException("Ya existe un empleado con el legajo indicado");
                    }
                });
    }

    private String normalizeLegajo(String legajo) {
        return legajo.trim().toUpperCase();
    }
}