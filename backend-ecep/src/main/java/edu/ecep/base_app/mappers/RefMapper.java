package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.*;
import org.mapstruct.ObjectFactory;
import org.springframework.stereotype.Component;

@Component
class RefMapper {
    protected <T extends BaseEntity> T ref(Long id, T t) {
        if (id == null) return null;
        t.setId(id);
        return t;
    }

    Evaluacion toEvaluacion(Long id) {
        if (id == null) return null;
        Evaluacion e = new Evaluacion();
        e.setId(id);
        return e;
    }
    JornadaAsistencia toJornadaAsistencia(Long id) {
        if (id == null) return null;
        JornadaAsistencia j = new JornadaAsistencia();
        j.setId(id);
        return j;
    }



    Alumno toAlumno(Long id) {
        return ref(id, new Alumno());
    }

    Familiar toFamiliar(Long id) {
        return ref(id, new Familiar());
    }

    Personal toPersonal(Long id) {
        return ref(id, new Personal());
    }

    PeriodoEscolar toPeriodoEscolar(Long id) {
        return ref(id, new PeriodoEscolar());
    }

    Trimestre toTrimestre(Long id) {
        return ref(id, new Trimestre());
    }

    Seccion toSeccion(Long id) {
        return ref(id, new Seccion());
    }

    Materia toMateria(Long id) {
        return ref(id, new Materia());
    }

    SeccionMateria toSeccionMateria(Long id) {
        return ref(id, new SeccionMateria());
    }

    Matricula toMatricula(Long id) {
        return ref(id, new Matricula());
    }

    EmisionCuota toEmisionCuota(Long id) {
        return ref(id, new EmisionCuota());
    }

    Cuota toCuota(Long id) {
        return ref(id, new Cuota());
    }

    Aspirante toAspirante(Long id) {return ref(id, new Aspirante());}


}

