import { UserRole } from "@/types/api-generated";

const ROLE_DISPLAY_ORDER: UserRole[] = [
  UserRole.DIRECTOR,
  UserRole.ADMIN,
  UserRole.SECRETARY,
  UserRole.COORDINATOR,
  UserRole.TEACHER,
  UserRole.ALTERNATE,
  UserRole.FAMILY,
  UserRole.STUDENT,
  UserRole.USER,
];

const ROLE_PRIORITY = new Map<UserRole, number>(
  ROLE_DISPLAY_ORDER.map((role, index) => [role, index]),
);

const DEFAULT_PRIORITY = ROLE_DISPLAY_ORDER.length;

/** Acepta valores del backend (enum string) y algunos sinónimos comunes. */
export function normalizeRole(r: string | UserRole): UserRole | null {
  if (!r) return null;

  const raw = String(r)
    .trim()
    .toUpperCase()
    .replace(/^ROLE_/, "")
    .replace(/_ROLE$/, "");

  // 1) si ya es un literal válido del enum -> devolvés directo
  if ((Object.values(UserRole) as string[]).includes(raw)) {
    return raw as UserRole;
  }

  // 2) opcional: sinónimos tolerantes (si no te hacen falta, podés borrar este map)
  const map: Record<string, UserRole> = {
    DOCENTE: UserRole.TEACHER,
    MAESTRO: UserRole.TEACHER,
    MAESTRA: UserRole.TEACHER,
    PROFESOR: UserRole.TEACHER,
    PROFESORA: UserRole.TEACHER,
    MAESTRO_TITULAR: UserRole.TEACHER,

    DIRECCION: UserRole.DIRECTOR,
    DIRECTIVO: UserRole.DIRECTOR,
    DIRECTIVA: UserRole.DIRECTOR,
    DIRECTORA: UserRole.DIRECTOR,

    SECRETARIA: UserRole.SECRETARY,
    SECRETARIO: UserRole.SECRETARY,
    COORDINADOR: UserRole.COORDINATOR,
    COORDINADORA: UserRole.COORDINATOR,
    SUPLENTE: UserRole.ALTERNATE,
    ADMINISTRADOR: UserRole.ADMIN,
    ADMINISTRADORA: UserRole.ADMIN,
  };

  return map[raw] ?? null;
}

/** Normaliza y deduplica una lista de roles. */
export function normalizeRoles(list?: Array<string | UserRole>): UserRole[] {
  if (!list?.length) return [];
  const out = new Set<UserRole>();
  for (const r of list) {
    const n = normalizeRole(r);
    if (n) out.add(n);
  }
  return sortRoles(Array.from(out));
}

export function sortRoles(list: UserRole[]): UserRole[] {
  return [...list].sort((a, b) => {
    const priorityDiff =
      (ROLE_PRIORITY.get(a) ?? DEFAULT_PRIORITY) -
      (ROLE_PRIORITY.get(b) ?? DEFAULT_PRIORITY);
    if (priorityDiff !== 0) return priorityDiff;
    return a.localeCompare(b);
  });
}

export function displayRole(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    [UserRole.USER]: "Usuario",
    [UserRole.ADMIN]: "Administrador",
    [UserRole.STUDENT]: "Alumno",
    [UserRole.FAMILY]: "Familia",
    [UserRole.TEACHER]: "Docente",
    [UserRole.DIRECTOR]: "Dirección",
    [UserRole.SECRETARY]: "Secretaría",
    [UserRole.COORDINATOR]: "Coordinación",
    [UserRole.ALTERNATE]: "Suplente",
  };
  return labels[role] ?? role;
}
