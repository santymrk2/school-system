package edu.ecep.base_app.asistencias.application;


import edu.ecep.base_app.asistencias.presentation.dto.AsistenciaAcumuladoDTO;
import edu.ecep.base_app.asistencias.presentation.dto.AsistenciaAlumnoResumenDTO;
import edu.ecep.base_app.asistencias.presentation.dto.AsistenciaDiaDTO;
import edu.ecep.base_app.gestionacademica.application.DocenteScopeService;
import edu.ecep.base_app.gestionacademica.domain.Seccion;
import edu.ecep.base_app.gestionacademica.presentation.dto.SeccionDTO;
import edu.ecep.base_app.gestionacademica.infrastructure.mapper.SeccionMapper;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.AsignacionDocenteMateriaRepository;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.AsignacionDocenteSeccionRepository;
import edu.ecep.base_app.asistencias.infrastructure.persistence.DetalleAsistenciaRepository;
import edu.ecep.base_app.asistencias.infrastructure.persistence.JornadaAsistenciaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AsistenciaQueryService {

    private final JornadaAsistenciaRepository jornadaRepo;
    private final DetalleAsistenciaRepository detalleRepo;
    private final AsignacionDocenteSeccionRepository asigSecRepo;
    private final AsignacionDocenteMateriaRepository asigMatRepo;
    private final SeccionMapper seccionMapper;
    private final DocenteScopeService docenteScopeService;

    private static final Comparator<Seccion> SECCION_COMPARATOR = Comparator
            .comparing(Seccion::getNivel)
            .thenComparing(Seccion::getGradoSala)
            .thenComparing(Seccion::getDivision)
            .thenComparing(Seccion::getTurno)
            .thenComparing(Seccion::getId);

    public List<SeccionDTO> seccionesVigentesDocente(Long empleadoId, LocalDate fecha) {
        Map<Long, Seccion> secciones = new LinkedHashMap<>();

        asigSecRepo.findSeccionesVigentesByEmpleado(empleadoId, fecha)
                .forEach(seccion -> secciones.putIfAbsent(seccion.getId(), seccion));

        asigMatRepo.findVigentesByEmpleado(empleadoId, fecha)
                .stream()
                .map(asignacion -> asignacion.getSeccionMateria().getSeccion())
                .forEach(seccion -> secciones.putIfAbsent(seccion.getId(), seccion));

        return secciones.values().stream()
                .sorted(SECCION_COMPARATOR)
                .map(seccionMapper::toDto)
                .toList();
    }

    public List<AsistenciaDiaDTO> historialSeccion(Long seccionId, LocalDate from, LocalDate to) {
        docenteScopeService.ensurePuedeAccederSeccion(seccionId);
        List<AsistenciaDiaDTO> lista = jornadaRepo.resumenDiario(seccionId, from, to);
        // completar porcentaje y ordenar
        lista.forEach(d -> d.setPorcentaje(pct(d.getPresentes(), d.getTotal())));
        return lista.stream()
                .sorted(Comparator.comparing(AsistenciaDiaDTO::getFecha).reversed())
                .toList();
    }

    public AsistenciaAcumuladoDTO acumuladoSeccion(Long seccionId, LocalDate from, LocalDate to) {
        docenteScopeService.ensurePuedeAccederSeccion(seccionId);
        AsistenciaAcumuladoDTO dto = detalleRepo.acumuladoSeccion(seccionId, from, to);
        if (dto == null) dto = new AsistenciaAcumuladoDTO();
        dto.setDesde(from);
        dto.setHasta(to);
        dto.setPorcentaje(pct(dto.getPresentes(), dto.getTotal()));
        return dto;
    }

    public List<AsistenciaAlumnoResumenDTO> resumenPorAlumno(Long seccionId, LocalDate from, LocalDate to) {
        docenteScopeService.ensurePuedeAccederSeccion(seccionId);
        List<AsistenciaAlumnoResumenDTO> lista = detalleRepo.resumenPorAlumno(seccionId, from, to);
        lista.forEach(d -> d.setPorcentaje(pct(d.getPresentes(), d.getTotal())));
        return lista;
    }

    private static double pct(int ok, int total) {
        if (total <= 0) return 0d;
        return Math.round((ok * 10000.0) / total) / 100.0;
    }
}
