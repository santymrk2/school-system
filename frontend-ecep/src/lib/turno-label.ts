const TURNO_LABELS: Record<string, string> = {
  MANANA: "Mañana",
  TARDE: "Tarde",
};

export const normalizeTurnoKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

export function formatTurnoLabel(turno?: string | null): string | null {
  if (turno == null) return null;
  const raw = String(turno).trim();
  if (!raw) return "";
  const normalized = normalizeTurnoKey(raw);
  if (normalized in TURNO_LABELS) {
    return TURNO_LABELS[normalized];
  }
  return raw;
}

export function formatTurnoLabelOrFallback(
  turno?: string | null,
  fallback: string = "—",
): string {
  const label = formatTurnoLabel(turno);
  if (!label) return fallback;
  return label;
}

export function appendTurnoLabel(
  base: string,
  turno?: string | null,
  options: { wrap?: (value: string) => string } = {},
): string {
  const label = formatTurnoLabel(turno);
  if (!label) return base;
  const wrap = options.wrap ?? ((value: string) => ` (${value})`);
  return `${base}${wrap(label)}`;
}

export const turnoLabels = TURNO_LABELS;
