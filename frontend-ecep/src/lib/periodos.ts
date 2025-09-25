import type { PeriodoEscolarDTO } from "@/types/api-generated";

export type PeriodoLabelResolver = (
  periodoId?: number | null,
  periodo?: Pick<PeriodoEscolarDTO, "anio"> | null,
) => string;

export function formatPeriodoLabel(
  periodo?: Pick<PeriodoEscolarDTO, "anio"> | null | undefined,
  fallbackId?: number | null,
): string {
  if (periodo?.anio != null) {
    return String(periodo.anio);
  }
  if (fallbackId != null) {
    return String(fallbackId);
  }
  return "—";
}
