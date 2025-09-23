"use client";

import type {
  TrimestreDTO,
  TrimestreEstadoApi,
} from "@/types/api-generated";

const toDateInput = (value?: string | null) => {
  if (!value) return "";
  const str = String(value);
  return str.length > 10 ? str.slice(0, 10) : str;
};

type MaybeTrimestre = Partial<TrimestreDTO> & Record<string, unknown>;

const getRawInicio = (t?: MaybeTrimestre | null) =>
  (t?.inicio as string | undefined) ??
  (t?.fechaInicio as string | undefined) ??
  (t?.fecha_inicio as string | undefined) ??
  null;

const getRawFin = (t?: MaybeTrimestre | null) =>
  (t?.fin as string | undefined) ??
  (t?.fechaFin as string | undefined) ??
  (t?.fecha_fin as string | undefined) ??
  null;

export const getTrimestreInicio = (
  t?: MaybeTrimestre | TrimestreDTO | null,
): string => toDateInput(getRawInicio(t as MaybeTrimestre));

export const getTrimestreFin = (
  t?: MaybeTrimestre | TrimestreDTO | null,
): string => toDateInput(getRawFin(t as MaybeTrimestre));

export const resolveTrimestrePeriodoId = (
  t: MaybeTrimestre | TrimestreDTO,
  fallback?: number | null,
): number | undefined =>
  (t?.periodoEscolarId as number | undefined) ??
  (t?.periodoId as number | undefined) ??
  (t as any)?.periodoEscolar?.id ??
  (fallback ?? undefined);

export type TrimestreEstado = "cerrado" | "activo" | "inactivo";

const normalizeEstado = (estado?: unknown): TrimestreEstado | null => {
  if (typeof estado === "string" && estado.trim()) {
    const normalized = estado.trim().toLowerCase();
    if (normalized === "activo" || normalized === "inactivo" || normalized === "cerrado") {
      return normalized as TrimestreEstado;
    }
  }
  return null;
};

export const getTrimestreEstado = (
  t?: MaybeTrimestre | TrimestreDTO | null,
): TrimestreEstado => {
  if (!t) return "inactivo";

  const rawEstado = (t as MaybeTrimestre & { estado?: TrimestreEstadoApi | string | null })?.estado;
  const normalized = normalizeEstado(rawEstado ?? undefined);
  if (normalized) return normalized;

  const rawCerrado = (t as MaybeTrimestre & { cerrado?: boolean | null })?.cerrado;
  if (rawCerrado === true) return "cerrado";
  if (rawCerrado === false) return "activo";

  return "inactivo";
};

export const TRIMESTRE_ESTADO_LABEL: Record<TrimestreEstado, string> = {
  activo: "Activo",
  inactivo: "Inactivo",
  cerrado: "Cerrado",
};

const formatSimpleDate = (iso?: string) => {
  if (!iso) return null;
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return null;
  const dd = day.padStart(2, "0");
  const mm = month.padStart(2, "0");
  return `${dd}/${mm}/${year}`;
};

export const formatTrimestreRange = (
  t?: MaybeTrimestre | TrimestreDTO | null,
): string | null => {
  const inicio = getTrimestreInicio(t);
  const fin = getTrimestreFin(t);
  if (!inicio && !fin) return null;
  const inicioFmt = formatSimpleDate(inicio) ?? inicio;
  const finFmt = formatSimpleDate(fin) ?? fin;
  if (inicio && fin) {
    return `Del ${inicioFmt} al ${finFmt}`;
  }
  if (inicio) {
    return `Desde ${inicioFmt}`;
  }
  if (fin) {
    return `Hasta ${finFmt}`;
  }
  return null;
};

export const isFechaDentroDeTrimestre = (
  fechaISO: string,
  trimestre?: MaybeTrimestre | TrimestreDTO | null,
): boolean => {
  if (!trimestre) return false;
  const inicio = getTrimestreInicio(trimestre);
  const fin = getTrimestreFin(trimestre);
  const afterStart = !inicio || fechaISO >= inicio;
  const beforeEnd = !fin || fechaISO <= fin;
  return afterStart && beforeEnd;
};
