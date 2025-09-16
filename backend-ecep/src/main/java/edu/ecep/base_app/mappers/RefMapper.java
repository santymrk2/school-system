package edu.ecep.base_app.mappers;

import org.springframework.stereotype.Component;
import edu.ecep.base_app.domain.*;

@Component
class RefMapper {

    // === Helpers por entidad (sin genéricos) ===

    Persona toPersona(Long id) {
        if (id == null) return null;
        Persona x = new Persona();
        x.setId(id);
        return x;
    }

    Alumno toAlumno(Long id) {
        if (id == null) return null;
        Alumno x = new Alumno();
        x.setId(id);
        return x;
    }

    Familiar toFamiliar(Long id) {
        if (id == null) return null;
        Familiar x = new Familiar();
        x.setId(id);
        return x;
    }

    Empleado toEmpleado(Long id) {
        if (id == null) return null;
        Empleado x = new Empleado();
        x.setId(id);
        return x;
    }

    PeriodoEscolar toPeriodoEscolar(Long id) {
        if (id == null) return null;
        PeriodoEscolar x = new PeriodoEscolar();
        x.setId(id);
        return x;
    }

    Trimestre toTrimestre(Long id) {
        if (id == null) return null;
        Trimestre x = new Trimestre();
        x.setId(id);
        return x;
    }

    Seccion toSeccion(Long id) {
        if (id == null) return null;
        Seccion x = new Seccion();
        x.setId(id);
        return x;
    }

    Materia toMateria(Long id) {
        if (id == null) return null;
        Materia x = new Materia();
        x.setId(id);
        return x;
    }

    SeccionMateria toSeccionMateria(Long id) {
        if (id == null) return null;
        SeccionMateria x = new SeccionMateria();
        x.setId(id);
        return x;
    }

    Matricula toMatricula(Long id) {
        if (id == null) return null;
        Matricula x = new Matricula();
        x.setId(id);
        return x;
    }

    EmisionCuota toEmisionCuota(Long id) {
        if (id == null) return null;
        EmisionCuota x = new EmisionCuota();
        x.setId(id);
        return x;
    }

    Cuota toCuota(Long id) {
        if (id == null) return null;
        Cuota x = new Cuota();
        x.setId(id);
        return x;
    }

    Aspirante toAspirante(Long id) {
        if (id == null) return null;
        Aspirante x = new Aspirante();
        x.setId(id);
        return x;
    }

    Evaluacion toEvaluacion(Long id) {
        if (id == null) return null;
        Evaluacion x = new Evaluacion();
        x.setId(id);
        return x;
    }

    JornadaAsistencia toJornadaAsistencia(Long id) {
        if (id == null) return null;
        JornadaAsistencia x = new JornadaAsistencia();
        x.setId(id);
        return x;
    }
}
