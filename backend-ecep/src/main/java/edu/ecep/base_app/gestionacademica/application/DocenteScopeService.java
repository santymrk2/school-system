package edu.ecep.base_app.gestionacademica.application;

import edu.ecep.base_app.gestionacademica.domain.AsignacionDocenteMateria;
import edu.ecep.base_app.gestionacademica.domain.Evaluacion;
import edu.ecep.base_app.gestionacademica.domain.SeccionMateria;
import edu.ecep.base_app.gestionacademica.domain.enums.RolSeccion;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.AsignacionDocenteMateriaRepository;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.AsignacionDocenteSeccionRepository;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.SeccionMateriaRepository;
import edu.ecep.base_app.identidad.domain.Persona;
import edu.ecep.base_app.identidad.infrastructure.persistence.EmpleadoRepository;
import edu.ecep.base_app.shared.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DocenteScopeService {

    private static final String ROLE_TEACHER = "ROLE_TEACHER";

    private final EmpleadoRepository empleadoRepository;
    private final AsignacionDocenteSeccionRepository asignacionDocenteSeccionRepository;
    private final AsignacionDocenteMateriaRepository asignacionDocenteMateriaRepository;
    private final SeccionMateriaRepository seccionMateriaRepository;

    public boolean isTeacher() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getAuthorities() == null) {
            return false;
        }
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(ROLE_TEACHER::equals);
    }

    public Optional<DocenteScope> getScope() {
        return getScope(LocalDate.now());
    }

    public Optional<DocenteScope> getScope(LocalDate fecha) {
        if (!isTeacher()) {
            return Optional.empty();
        }
        Long personaId = currentPersonaId();
        if (personaId == null) {
            return Optional.empty();
        }
        return empleadoRepository.findByPersonaId(personaId)
                .map(empleado -> buildScope(empleado.getId(), fecha));
    }

    public void ensurePuedeAccederSeccion(Long seccionId) {
        if (seccionId == null || !isTeacher()) {
            return;
        }
        DocenteScope scope = requireScope();
        if (!scope.puedeAccederSeccion(seccionId)) {
            throw new UnauthorizedException("No tiene permisos para acceder a la sección solicitada.");
        }
    }

    public void ensurePuedeGestionarSeccionMateria(Long seccionMateriaId) {
        if (seccionMateriaId == null || !isTeacher()) {
            return;
        }
        DocenteScope scope = requireScope();
        if (!scope.puedeGestionarSeccionMateria(seccionMateriaId)) {
            throw new UnauthorizedException("No tiene permisos para operar sobre la materia solicitada.");
        }
    }

    public void ensurePuedeGestionarEvaluacion(Evaluacion evaluacion) {
        if (evaluacion == null) {
            return;
        }
        ensurePuedeGestionarSeccionMateria(evaluacion.getSeccionMateria().getId());
    }

    private DocenteScope requireScope() {
        return getScope().orElseThrow(() ->
                new UnauthorizedException("No se encontraron asignaciones vigentes para el docente."));
    }

    private DocenteScope buildScope(Long empleadoId, LocalDate fecha) {
        var seccionAssignments = asignacionDocenteSeccionRepository.findVigentesByEmpleado(empleadoId, fecha);
        var materiaAssignments = asignacionDocenteMateriaRepository.findVigentesByEmpleado(empleadoId, fecha);

        Set<Long> seccionesTitular = seccionAssignments.stream()
                .filter(a -> a.getRol() == RolSeccion.MAESTRO_TITULAR)
                .map(a -> a.getSeccion().getId())
                .collect(Collectors.toCollection(HashSet::new));

        Set<Long> seccionesConMateria = materiaAssignments.stream()
                .map(a -> a.getSeccionMateria().getSeccion().getId())
                .collect(Collectors.toCollection(HashSet::new));

        Set<Long> seccionesAccesibles = new HashSet<>(seccionesConMateria);
        seccionesAccesibles.addAll(seccionesTitular);

        Set<Long> seccionMateriasGestionables = new HashSet<>();
        Map<Long, Long> seccionPorSeccionMateria = new HashMap<>();

        for (AsignacionDocenteMateria asignacion : materiaAssignments) {
            Long seccionMateriaId = asignacion.getSeccionMateria().getId();
            Long seccionId = asignacion.getSeccionMateria().getSeccion().getId();
            seccionMateriasGestionables.add(seccionMateriaId);
            seccionPorSeccionMateria.put(seccionMateriaId, seccionId);
        }

        if (!seccionesTitular.isEmpty()) {
            for (Long seccionId : seccionesTitular) {
                for (SeccionMateria seccionMateria : seccionMateriaRepository.findBySeccionId(seccionId)) {
                    seccionMateriasGestionables.add(seccionMateria.getId());
                    seccionPorSeccionMateria.putIfAbsent(seccionMateria.getId(), seccionId);
                }
            }
        }

        return new DocenteScope(
                empleadoId,
                Set.copyOf(seccionesTitular),
                Set.copyOf(seccionesConMateria),
                Set.copyOf(seccionesAccesibles),
                Set.copyOf(seccionMateriasGestionables),
                Map.copyOf(seccionPorSeccionMateria)
        );
    }

    private Long currentPersonaId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return null;
        }
        Object details = auth.getDetails();
        if (details instanceof Persona persona) {
            return persona.getId();
        }
        try {
            return Long.valueOf(auth.getName());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    public record DocenteScope(Long empleadoId,
                               Set<Long> seccionesTitular,
                               Set<Long> seccionesConMateria,
                               Set<Long> seccionesAccesibles,
                               Set<Long> seccionMateriasGestionables,
                               Map<Long, Long> seccionPorSeccionMateria) {

        public boolean puedeAccederSeccion(Long seccionId) {
            return seccionesAccesibles.contains(seccionId);
        }

        public boolean puedeGestionarSeccionMateria(Long seccionMateriaId) {
            return seccionMateriasGestionables.contains(seccionMateriaId);
        }

        public Long seccionDeSeccionMateria(Long seccionMateriaId) {
            return seccionPorSeccionMateria.get(seccionMateriaId);
        }
    }
}
