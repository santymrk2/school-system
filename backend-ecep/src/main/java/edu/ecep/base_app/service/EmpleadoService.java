package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.Empleado;
import edu.ecep.base_app.domain.Persona;
import edu.ecep.base_app.dtos.EmpleadoCreateDTO;
import edu.ecep.base_app.dtos.EmpleadoDTO;
import edu.ecep.base_app.dtos.EmpleadoUpdateDTO;
import edu.ecep.base_app.mappers.EmpleadoMapper;
import edu.ecep.base_app.repos.*;
import edu.ecep.base_app.util.NotFoundException;
import edu.ecep.base_app.util.ReferencedException;
import edu.ecep.base_app.util.ReferencedWarning;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmpleadoService {

    private final EmpleadoRepository repo;
    private final PersonaRepository personaRepository;
    private final AsignacionDocenteSeccionRepository adsRepo;
    private final AsignacionDocenteMateriaRepository admRepo;
    private final ReciboSueldoRepository reciboRepo;
    private final LicenciaRepository licenciaRepo;
    private final AsistenciaEmpleadoRepository asistenciaRepo;
    private final EmpleadoMapper mapper;

    public List<EmpleadoDTO> findAll() {
        return repo.findAll(Sort.by("id")).stream()
                .map(mapper::toDto)
                .toList();
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

        // 3) Crear empleado (si usás @MapsId, el id del empleado será el de persona)
        Empleado p = new Empleado();
        p.setPersona(persona);
        p.setRolEmpleado(dto.getRolEmpleado());
        p.setCuil(dto.getCuil());
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
}