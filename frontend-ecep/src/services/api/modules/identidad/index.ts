import { login, logout, me, checkEmail } from "./auth";
import {
  alumnos,
  familiares,
  alumnoFamiliares,
  familiaresAlumnos,
} from "./personas";
import { personasCore } from "./personas-core";
import { empleados, licencias, formaciones } from "./empleados";

export const identidad = {
  login,
  logout,
  me,
  checkEmail,
  alumnos,
  familiares,
  alumnoFamiliares,
  familiaresAlumnos,
  personasCore,
  empleados,
  licencias,
  formaciones,
};

export {
  login,
  logout,
  me,
  checkEmail,
  alumnos,
  familiares,
  alumnoFamiliares,
  familiaresAlumnos,
  personasCore,
  empleados,
  licencias,
  formaciones,
};
