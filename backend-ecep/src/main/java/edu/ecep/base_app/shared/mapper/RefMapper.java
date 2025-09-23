package edu.ecep.base_app.shared.mapper;

import edu.ecep.base_app.admisiones.domain.Aspirante;
import edu.ecep.base_app.asistencias.domain.JornadaAsistencia;
import edu.ecep.base_app.calendario.domain.PeriodoEscolar;
import edu.ecep.base_app.finanzas.domain.Cuota;
import edu.ecep.base_app.finanzas.domain.EmisionCuota;
import edu.ecep.base_app.gestionacademica.domain.Evaluacion;
import edu.ecep.base_app.gestionacademica.domain.Materia;
import edu.ecep.base_app.gestionacademica.domain.Seccion;
import edu.ecep.base_app.gestionacademica.domain.SeccionMateria;
import edu.ecep.base_app.gestionacademica.domain.Trimestre;
import edu.ecep.base_app.identidad.domain.Alumno;
import edu.ecep.base_app.identidad.domain.Empleado;
import edu.ecep.base_app.identidad.domain.Familiar;
import edu.ecep.base_app.identidad.domain.Persona;
import edu.ecep.base_app.vidaescolar.domain.Matricula;
import org.springframework.stereotype.Component;

@Component
public class RefMapper {

    // === Helpers por entidad (sin genéricos) ===

    public Persona toPersona(Long id) {
        if (id == null) return null;
        Persona x = new Persona();
        x.setId(id);
        return x;
    }

    public Alumno toAlumno(Long id) {
        if (id == null) return null;
        Alumno x = new Alumno();
        x.setId(id);
        return x;
    }

    public Familiar toFamiliar(Long id) {
        if (id == null) return null;
        Familiar x = new Familiar();
        x.setId(id);
        return x;
    }

    public Empleado toEmpleado(Long id) {
        if (id == null) return null;
        Empleado x = new Empleado();
        x.setId(id);
        return x;
    }

    public PeriodoEscolar toPeriodoEscolar(Long id) {
        if (id == null) return null;
        PeriodoEscolar x = new PeriodoEscolar();
        x.setId(id);
        return x;
    }

    public Trimestre toTrimestre(Long id) {
        if (id == null) return null;
        Trimestre x = new Trimestre();
        x.setId(id);
        return x;
    }

    public Seccion toSeccion(Long id) {
        if (id == null) return null;
        Seccion x = new Seccion();
        x.setId(id);
        return x;
    }

    public Materia toMateria(Long id) {
        if (id == null) return null;
        Materia x = new Materia();
        x.setId(id);
        return x;
    }

    public SeccionMateria toSeccionMateria(Long id) {
        if (id == null) return null;
        SeccionMateria x = new SeccionMateria();
        x.setId(id);
        return x;
    }

    public Matricula toMatricula(Long id) {
        if (id == null) return null;
        Matricula x = new Matricula();
        x.setId(id);
        return x;
    }

    public EmisionCuota toEmisionCuota(Long id) {
        if (id == null) return null;
        EmisionCuota x = new EmisionCuota();
        x.setId(id);
        return x;
    }

    public Cuota toCuota(Long id) {
        if (id == null) return null;
        Cuota x = new Cuota();
        x.setId(id);
        return x;
    }

    public Aspirante toAspirante(Long id) {
        if (id == null) return null;
        Aspirante x = new Aspirante();
        x.setId(id);
        return x;
    }

    public Evaluacion toEvaluacion(Long id) {
        if (id == null) return null;
        Evaluacion x = new Evaluacion();
        x.setId(id);
        return x;
    }

    public JornadaAsistencia toJornadaAsistencia(Long id) {
        if (id == null) return null;
        JornadaAsistencia x = new JornadaAsistencia();
        x.setId(id);
        return x;
    }
}
