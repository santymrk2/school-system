import type { useViewerScope } from "@/hooks/scope/useViewerScope";
import { UserRole, type ComunicadoDTO } from "@/types/api-generated";

type ViewerScopeType = ReturnType<typeof useViewerScope>["type"];

type MaybeSet<T> = Set<T> | undefined;

const ADMIN_LIKE_ROLES = new Set<UserRole>([
  UserRole.DIRECTOR,
  UserRole.ADMIN,
  UserRole.SECRETARY,
  UserRole.COORDINATOR,
]);

const TEACHER_ROLES = new Set<UserRole>([
  UserRole.TEACHER,
  UserRole.ALTERNATE,
]);

export function isAdminLikeRole(role: UserRole | null | undefined) {
  return role != null && ADMIN_LIKE_ROLES.has(role);
}

export function isTeacherRole(role: UserRole | null | undefined) {
  return role != null && TEACHER_ROLES.has(role);
}

export function nivelEnumFromSeccion(
  s: any,
): "INICIAL" | "PRIMARIO" {
  const n = (
    s?.nivel ??
    s?.seccionActual?.nivel ??
    s?.seccion?.nivel ??
    ""
  )
    .toString()
    .toUpperCase();
  return n === "PRIMARIO" ? "PRIMARIO" : "INICIAL";
}

export function seccionIdFrom(item: any): number | null {
  if (!item) return null;
  if (typeof item.seccionId === "number") return item.seccionId;
  if (typeof item.seccionId === "string") return Number(item.seccionId);
  if (typeof item?.seccionActual?.id === "number") return item.seccionActual.id;
  if (typeof item?.seccion?.id === "number") return item.seccion.id;
  if (typeof item?.seccionId?.id === "number") return item.seccionId.id;
  return null;
}

export function buildMisSeccionesIds(
  type: ViewerScopeType,
  secciones: any[] | undefined,
  hijos: any[] | undefined,
): MaybeSet<number> {
  if (type === "teacher") {
    return new Set<number>(
      (secciones ?? [])
        .map((s: any) => Number(seccionIdFrom(s) ?? s?.id))
        .filter((id): id is number => Number.isFinite(id)),
    );
  }
  if (type === "family" || type === "student") {
    const ids = (hijos ?? [])
      .map((h: any) => seccionIdFrom(h) ?? seccionIdFrom(h?.seccionActual))
      .filter((id): id is number => typeof id === "number" && !Number.isNaN(id));
    return new Set<number>(ids);
  }
  return undefined;
}

export function buildMisNiveles(
  type: ViewerScopeType,
  secciones: any[] | undefined,
  hijos: any[] | undefined,
): MaybeSet<string> {
  const niveles: Array<"INICIAL" | "PRIMARIO"> = [];
  if (type === "teacher") {
    for (const s of secciones ?? []) niveles.push(nivelEnumFromSeccion(s));
  } else if (type === "family" || type === "student") {
    for (const h of hijos ?? []) niveles.push(nivelEnumFromSeccion(h));
  }
  return niveles.length ? new Set<string>(niveles) : undefined;
}

type VisibleParams = {
  comunicados: ComunicadoDTO[] | undefined;
  type: ViewerScopeType;
  role: UserRole | null | undefined;
  misSeccionesIds?: MaybeSet<number>;
  misNiveles?: MaybeSet<string>;
  secciones?: any[];
  hijos?: any[];
};

export function filterVisibleComunicados({
  comunicados,
  type,
  role,
  misSeccionesIds,
  misNiveles,
  secciones,
  hijos,
}: VisibleParams) {
  const todos = comunicados ?? [];

  const adminLike = isAdminLikeRole(role);

  if (type === "staff" || adminLike) {
    return todos;
  }

  const seccionIds =
    misSeccionesIds ?? buildMisSeccionesIds(type, secciones, hijos);
  const niveles = misNiveles ?? buildMisNiveles(type, secciones, hijos);

  return todos.filter((c) => {
    if (c.alcance === "INSTITUCIONAL") return true;
    if (c.alcance === "POR_NIVEL") {
      if (!c.nivel) return false;
      if (!niveles) return false;
      return niveles.has(String(c.nivel).toUpperCase());
    }
    if (c.alcance === "POR_SECCION") {
      const id = c.seccionId;
      if (typeof id !== "number") return false;
      if (!seccionIds) return false;
      return seccionIds.has(id);
    }
    return false;
  });
}

export function splitComunicadosPorAlcance(comunicados: ComunicadoDTO[]) {
  const generales: ComunicadoDTO[] = [];
  const especificos: ComunicadoDTO[] = [];

  for (const c of comunicados) {
    if (c.alcance === "INSTITUCIONAL") {
      generales.push(c);
    } else if (c.alcance === "POR_NIVEL" || c.alcance === "POR_SECCION") {
      especificos.push(c);
    }
  }

  return { generales, especificos };
}
