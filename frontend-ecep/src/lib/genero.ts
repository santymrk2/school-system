export const GENERO_OPTIONS = [
  { value: "Masculino", label: "Masculino" },
  { value: "Femenino", label: "Femenino" },
  { value: "No especifica", label: "No especifica" },
] as const;

export type GeneroOptionValue = (typeof GENERO_OPTIONS)[number]["value"];

export const DEFAULT_GENERO_VALUE: GeneroOptionValue = "No especifica";

export const normalizeGenero = (
  value?: string | null,
): GeneroOptionValue | "" => {
  if (!value) return "";
  const normalized = value.trim().toLowerCase();
  const option = GENERO_OPTIONS.find(
    (item) => item.value.toLowerCase() === normalized,
  );
  return option ? option.value : "";
};
