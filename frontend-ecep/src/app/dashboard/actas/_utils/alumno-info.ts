import { identidad } from "@/services/api/modules";
import type {
  AlumnoDTO,
  AlumnoFamiliarDTO,
  PersonaDTO,
} from "@/types/api-generated";

export type AlumnoExtendedInfo = {
  name: string;
  dni?: string | null;
  familiarName?: string | null;
  familiarDni?: string | null;
  section?: string | null;
  level?: "Inicial" | "Primario" | null;
};

const buildFullName = (
  apellido?: string | null,
  nombre?: string | null,
) => {
  const lastName = (apellido ?? "").trim();
  const firstName = (nombre ?? "").trim();
  if (lastName && firstName) return `${lastName}, ${firstName}`;
  return (lastName || firstName || "").trim();
};

const groupFamiliaresPorAlumno = (items: AlumnoFamiliarDTO[]) => {
  const map = new Map<number, AlumnoFamiliarDTO[]>();
  for (const item of items) {
    if (!item) continue;
    const alumnoId = item.alumnoId;
    if (alumnoId == null) continue;
    const list = map.get(alumnoId) ?? [];
    list.push(item);
    map.set(alumnoId, list);
  }
  return map;
};

const fetchPersonaMap = async (personaIds: number[]) => {
  const uniqueIds = Array.from(new Set(personaIds.filter((id) => Number.isFinite(id))));
  const map = new Map<number, PersonaDTO | null>();
  if (!uniqueIds.length) return map;

  try {
    const { data } = await identidad.personasCore.getManyById(uniqueIds);
    const list = Array.isArray(data) ? data : [];
    for (const persona of list as PersonaDTO[]) {
      if (persona?.id != null) {
        map.set(persona.id, persona);
      }
    }
    const missing = uniqueIds.filter((id) => !map.has(id));
    if (!missing.length) return map;
    const fallback = await Promise.all(
      missing.map(async (id) => {
        try {
          const res = await identidad.personasCore.getById(id);
          return [id, res.data ?? null] as const;
        } catch {
          return [id, null] as const;
        }
      }),
    );
    for (const [id, persona] of fallback) {
      map.set(id, persona);
    }
    return map;
  } catch {
    const singles = await Promise.all(
      uniqueIds.map(async (id) => {
        try {
          const res = await identidad.personasCore.getById(id);
          return [id, res.data ?? null] as const;
        } catch {
          return [id, null] as const;
        }
      }),
    );
    for (const [id, persona] of singles) {
      map.set(id, persona);
    }
    return map;
  }
};

export const fetchAlumnoExtendedInfo = async (
  alumnoIds: number[],
): Promise<Map<number, AlumnoExtendedInfo>> => {
  const uniqueAlumnoIds = Array.from(
    new Set(alumnoIds.filter((id) => Number.isFinite(id))) as number[],
  );
  const result = new Map<number, AlumnoExtendedInfo>();
  if (!uniqueAlumnoIds.length) return result;

  const [familiares, alumnoPairs] = await Promise.all([
    identidad.alumnoFamiliares
      .list()
      .then((res) =>
        Array.isArray(res.data) ? (res.data as AlumnoFamiliarDTO[]) : [],
      )
      .catch(() => [] as AlumnoFamiliarDTO[]),
    Promise.all(
      uniqueAlumnoIds.map(async (alumnoId) => {
        try {
          const res = await identidad.alumnos.byId(alumnoId);
          return [alumnoId, res.data ?? null] as const;
        } catch {
          return [alumnoId, null] as const;
        }
      }),
    ),
  ]);

  const alumnoMap = new Map<number, AlumnoDTO | null>(alumnoPairs);
  const familiaresPorAlumno = groupFamiliaresPorAlumno(familiares);

  const personaIds = new Set<number>();
  const familiarSeleccionadoPorAlumno = new Map<number, number>();

  for (const [alumnoId, alumno] of alumnoMap.entries()) {
    const personaId = alumno?.personaId ?? alumno?.id ?? null;
    if (personaId != null) personaIds.add(personaId);
    const familiaresAlumno = familiaresPorAlumno.get(alumnoId) ?? [];
    const elegido = familiaresAlumno.find((f) => f?.convive) ?? familiaresAlumno[0];
    if (elegido?.familiarId != null) {
      familiarSeleccionadoPorAlumno.set(alumnoId, elegido.familiarId);
      personaIds.add(elegido.familiarId);
    }
  }

  const personaMap = await fetchPersonaMap(Array.from(personaIds));

  for (const alumnoId of uniqueAlumnoIds) {
    const alumno = alumnoMap.get(alumnoId) ?? null;
    const personaId = alumno?.personaId ?? alumno?.id ?? null;
    const persona = personaId != null ? personaMap.get(personaId) ?? null : null;
    const nombre = buildFullName(
      persona?.apellido ?? alumno?.apellido,
      persona?.nombre ?? alumno?.nombre,
    );
    const dni = persona?.dni ?? alumno?.dni ?? null;

    const familiarPersonaId = familiarSeleccionadoPorAlumno.get(alumnoId);
    const familiarPersona =
      familiarPersonaId != null ? personaMap.get(familiarPersonaId) ?? null : null;
    const familiarNombre =
      familiarPersonaId != null
        ? buildFullName(familiarPersona?.apellido, familiarPersona?.nombre) ||
          `Familiar #${familiarPersonaId}`
        : null;
    const familiarDni =
      familiarPersonaId != null ? familiarPersona?.dni ?? null : null;

    const sectionName = (alumno?.seccionActualNombre ?? "").trim();
    const normalized = sectionName.toLowerCase();
    const level: "Inicial" | "Primario" | null = sectionName
      ? normalized.includes("inicial") || normalized.includes("sala")
        ? "Inicial"
        : "Primario"
      : null;

    result.set(alumnoId, {
      name: nombre || `Alumno #${alumnoId}`,
      dni: dni ?? null,
      familiarName: familiarNombre ?? null,
      familiarDni,
      section: sectionName || null,
      level,
    });
  }

  return result;
};
