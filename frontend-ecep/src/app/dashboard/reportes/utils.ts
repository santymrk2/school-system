import type { BoletinSubjectGrade } from "./types";

const dateFormatter = new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" });

export const tipoLicenciaOptions = [
  { value: "ENFERMEDAD", label: "Enfermedad" },
  { value: "CUIDADO_FAMILIAR", label: "Cuidado familiar" },
  { value: "FORMACION", label: "Formación" },
  { value: "PERSONAL", label: "Motivo personal" },
  { value: "MATERNIDAD", label: "Maternidad / Paternidad" },
  { value: "OTRA", label: "Otra" },
] as const;

export const sanitizeTeacherName = (teacher?: string | null) => {
  if (!teacher) return null;
  const trimmed = String(teacher).trim();
  return trimmed && trimmed !== "—" ? trimmed : null;
};

export const getBoletinGradeDisplay = (grade?: BoletinSubjectGrade | null) => {
  if (!grade) return "—";

  const conceptual = grade.notaConceptual?.trim();
  if (conceptual && conceptual !== "—") {
    return formatConceptualGrade(conceptual);
  }

  const numeric = typeof grade.notaNumerica === "number" ? grade.notaNumerica : null;
  if (numeric != null && Number.isFinite(numeric)) {
    return numeric.toFixed(1);
  }

  return "—";
};

export const formatPercent = (value: number, digits = 0) =>
  `${(value * 100).toFixed(digits)}%`;

function formatConceptualGrade(value: string) {
  const cleaned = value.replace(/_/g, " ").replace(/\s+/g, " ").trim();

  if (!cleaned) return value;

  return cleaned.toUpperCase();
}

export const parseISO = (value: string) => new Date(`${value}T00:00:00`);

export const withinRange = (value: string, from?: string, to?: string) => {
  const date = parseISO(value).getTime();
  if (from) {
    const fromDate = parseISO(from).getTime();
    if (date < fromDate) return false;
  }
  if (to) {
    const toDate = parseISO(to).getTime();
    if (date > toDate) return false;
  }
  return true;
};

export const formatDate = (value?: string | null) => {
  if (!value) return "";
  const parsed = parseISO(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return dateFormatter.format(parsed);
};

export const formatTipoLicencia = (value?: string | null) => {
  if (!value) return "Sin tipo";
  const option = tipoLicenciaOptions.find((opt) => opt.value === value);
  if (option) return option.label;
  const normalized = value.replace(/_/g, " ").toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export const toDateOrNull = (value?: string | null) => {
  if (!value) return null;
  const parsed = parseISO(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

export const startOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};
