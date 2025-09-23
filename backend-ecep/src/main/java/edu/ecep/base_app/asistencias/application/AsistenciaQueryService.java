package edu.ecep.base_app.asistencias.application;


import edu.ecep.base_app.gestionacademica.domain.Seccion;
import edu.ecep.base_app.gestionacademica.presentation.dto.SeccionDTO;
import edu.ecep.base_app.asistencias.presentation.dto.*;
import edu.ecep.base_app.gestionacademica.infrastructure.mapper.SeccionMapper; // si lo tenés; si no, mapeamos a mano
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.AsignacionDocenteSeccionRepository;
import edu.ecep.base_app.asistencias.infrastructure.persistence.DetalleAsistenciaRepository;
import edu.ecep.base_app.asistencias.infrastructure.persistence.JornadaAsistenciaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AsistenciaQueryService {

    private final JornadaAsistenciaRepository jornadaRepo;
    private final DetalleAsistenciaRepository detalleRepo;
    private final AsignacionDocenteSeccionRepository asigSecRepo;
    private final SeccionMapper seccionMapper;

    public List<SeccionDTO> seccionesVigentesDocente(Long empleadoId, LocalDate fecha) {
        List<Seccion> secciones = asigSecRepo.findSeccionesVigentesByEmpleado(empleadoId, fecha);
        return secciones.stream().map(seccionMapper::toDto).toList();
    }

    public List<AsistenciaDiaDTO> historialSeccion(Long seccionId, LocalDate from, LocalDate to) {
        List<AsistenciaDiaDTO> lista = jornadaRepo.resumenDiario(seccionId, from, to);
        // completar porcentaje y ordenar
        lista.forEach(d -> d.setPorcentaje(pct(d.getPresentes(), d.getTotal())));
        return lista.stream()
                .sorted(Comparator.comparing(AsistenciaDiaDTO::getFecha).reversed())
                .toList();
    }

    public AsistenciaAcumuladoDTO acumuladoSeccion(Long seccionId, LocalDate from, LocalDate to) {
        AsistenciaAcumuladoDTO dto = detalleRepo.acumuladoSeccion(seccionId, from, to);
        if (dto == null) dto = new AsistenciaAcumuladoDTO();
        dto.setDesde(from);
        dto.setHasta(to);
        dto.setPorcentaje(pct(dto.getPresentes(), dto.getTotal()));
        return dto;
    }

    public List<AsistenciaAlumnoResumenDTO> resumenPorAlumno(Long seccionId, LocalDate from, LocalDate to) {
        List<AsistenciaAlumnoResumenDTO> lista = detalleRepo.resumenPorAlumno(seccionId, from, to);
        lista.forEach(d -> d.setPorcentaje(pct(d.getPresentes(), d.getTotal())));
        return lista;
    }

    private static double pct(int ok, int total) {
        if (total <= 0) return 0d;
        return Math.round((ok * 10000.0) / total) / 100.0;
    }
}
