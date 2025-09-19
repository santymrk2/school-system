// src/lib/form-utils.ts
export enum InternetConnectivity {
  SATELITAL = "Satelital",
  WIFI = "Wifi",
  DATOS_MOVILES = "Datos Moviles",
  CABLE = "Cable",
  SIN_CONEXION = "Sin Conexión",
}

// Solo dígitos, hasta 10 caracteres
export function formatDni(s: string) {
  return s.replace(/\D/g, "").slice(0, 10);
}

const MIN_BIRTH_AGE_YEARS = 2;

export function getBirthDateLimitIso(reference: Date = new Date()) {
  const limit = new Date(reference);
  limit.setFullYear(limit.getFullYear() - MIN_BIRTH_AGE_YEARS);
  return limit.toISOString().slice(0, 10);
}

// Fecha máxima: personas de al menos 2 años
export const maxBirthDate = getBirthDateLimitIso();

export function isBirthDateValid(
  value?: string | null,
  reference: Date = new Date(),
) {
  if (!value) return true;
  return value <= getBirthDateLimitIso(reference);
}

// Tipado parcial de los datos del Step 1
export interface Step1Data {
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  cursoSolicitado?: string;
  turnoPreferido?: string;
  conectividadInternet?: string;
}

// Devuelve un mensaje de error o null si está todo ok
export function validateStep1(data: Step1Data): string | null {
  if (!data.nombre) return "El nombre es obligatorio.";
  if (!data.apellido) return "El apellido es obligatorio.";
  if (!data.dni) return "El DNI es obligatorio.";
  if (data.dni.length < 7 || data.dni.length > 10)
    return "El DNI debe tener entre 7 y 10 dígitos.";
  if (!data.fechaNacimiento) return "La fecha de nacimiento es obligatoria.";
  if (!data.cursoSolicitado) return "Seleccione un curso.";
  if (!data.turnoPreferido) return "Seleccione un turno.";
  if (!data.conectividadInternet) return "Seleccione tipo de conectividad.";
  return null;
}
