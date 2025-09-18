export * from "./http";

import * as auth from "./modules/auth";
import * as users from "./modules/users";
import * as calendario from "./modules/calendario";
import * as estructura from "./modules/estructura";
import * as docencia from "./modules/docencia";
import * as personas from "./modules/personas";
import * as matriculas from "./modules/matriculas";
import * as academico from "./modules/academico";
import * as asistencias from "./modules/asistencias";
import * as comunicados from "./modules/comunicados";
import * as finanzas from "./modules/finanzas";
import * as empleados from "./modules/empleados";
import * as actasAccidente from "./modules/actasAccidente";
import * as chat from "./modules/chat";
import * as aspirantes from "./modules/aspirantes";
import * as personasCore from "./modules/personas-core";
import * as secciones from "./modules/secciones";

export const api = {
  // auth “planos”
  login: auth.login,
  logout: auth.logout,
  me: auth.me,

  // users
  user: users.user,
  searchUsers: users.searchUsers,

  // calendario
  periodos: calendario.periodos,
  trimestres: calendario.trimestres,

  // estructura
  secciones: secciones.secciones,
  materias: estructura.materias,
  seccionMaterias: estructura.seccionMaterias,
  seccionesAlumnos: secciones.seccionesAlumnos,

  // docencia
  asignacionDocenteSeccion: docencia.asignacionDocenteSeccion,
  asignacionDocenteMateria: docencia.asignacionDocenteMateria,

  // personas
  alumnos: personas.alumnos,
  familiares: personas.familiares,
  alumnoFamiliares: personas.alumnoFamiliares,
  familiaresAlumnos: personas.familiaresAlumnos,

  // matrícula
  matriculas: matriculas.matriculas,
  matriculaSeccionHistorial: matriculas.matriculaSeccionHistorial,
  solicitudesBaja: matriculas.solicitudesBaja,

  // académico
  evaluaciones: academico.evaluaciones,
  resultadosEvaluacion: academico.resultados,
  calificaciones: academico.calificaciones,
  informes: academico.informes,

  // asistencias
  asistencias: asistencias.asistencias,
  detallesAsistencia: asistencias.detallesAsistencia,
  jornadasAsistencia: asistencias.jornadasAsistencia,
  diasNoHabiles: asistencias.diasNoHabiles,

  // comunicados
  comunicados: comunicados.comunicados,

  // finanzas
  emisionesCuota: finanzas.emisionesCuota,
  cuotas: finanzas.cuotas,
  pagosCuota: finanzas.pagosCuota,
  recibos: finanzas.recibos,

  // empleados
  empleados: empleados.empleados,
  licencias: empleados.licencias,
  formaciones: empleados.formaciones,

  // actas
  actasAccidente: actasAccidente.actasAccidente,

  // chat
  chat: chat.chat,

  // aspirantes
  aspirantes: aspirantes.aspirantes,
  solicitudesAdmision: aspirantes.solicitudesAdmision,
  aspiranteFamiliares: aspirantes.aspiranteFamiliares,

  personasCore: personasCore.personasCore,
};
