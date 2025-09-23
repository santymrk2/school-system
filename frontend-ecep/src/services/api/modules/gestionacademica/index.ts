import {
  evaluaciones,
  resultados,
  calificaciones,
  informes,
} from "./academico";
import {
  asignacionDocenteSeccion,
  asignacionDocenteMateria,
} from "./docencia";
import { materias, seccionMaterias } from "./estructura";
import { secciones, seccionesAlumnos } from "./secciones";

export const gestionAcademica = {
  evaluaciones,
  resultados,
  resultadosEvaluacion: resultados,
  calificaciones,
  informes,
  asignacionDocenteSeccion,
  asignacionDocenteMateria,
  materias,
  seccionMaterias,
  secciones,
  seccionesAlumnos,
};

export {
  evaluaciones,
  resultados,
  calificaciones,
  informes,
  asignacionDocenteSeccion,
  asignacionDocenteMateria,
  materias,
  seccionMaterias,
  secciones,
  seccionesAlumnos,
};
