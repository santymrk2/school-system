// services/api/modules/secciones.ts
import { http } from "../http";
import type * as DTO from "@/types/api-generated";

const isLazyOr500 = (e: any) =>
  e?.code === "LAZY_INITIALIZATION" || e?.status === 500;

// Fallback SIN /{id} (evita 403) y usando campos correctos: 'desde'/'hasta'
async function rosterViaHistorial(seccionId: number) {
  // 1) Traer sección para conocer periodoEscolarId
  const seccion = await http
    .get<DTO.SeccionDTO>(`/api/secciones/${seccionId}`)
    .then((r) => r.data);

  const periodoId =
    (seccion as any)?.periodoEscolarId ?? (seccion as any)?.periodoEscolar?.id;

  // 2) Historial completo → vigentes en esta sección (hasta == null)
  const historial = await http
    .get<DTO.MatriculaSeccionHistorialDTO[]>("/api/matriculas/historial")
    .then((r) => r.data ?? []);

  const vigentes = (historial as any[]).filter(
    (h) => (h.seccionId ?? h.seccion?.id) === seccionId && h.hasta == null, // ← campo correcto
  );

  const matriculaIds = Array.from(
    new Set(
      vigentes.map((h) => h.matriculaId ?? h.matricula?.id).filter(Boolean),
    ),
  ) as number[];

  if (matriculaIds.length === 0) return [] as DTO.AlumnoLiteDTO[];

  // 3) Traer TODAS las matrículas (list) y filtrar por ids + período de la sección
  const mats = await http
    .get<DTO.MatriculaDTO[]>("/api/matriculas")
    .then((r) => r.data ?? []);

  const matsOk = (mats as any[]).filter(
    (m) =>
      matriculaIds.includes(m.id) &&
      (m.periodoEscolarId ?? m.periodoEscolar?.id) === periodoId,
  );

  if (matsOk.length === 0) return [] as DTO.AlumnoLiteDTO[];

  // 4) Traer TODOS los alumnos (list) y mapear alumnoId -> personaId
  const alumnosAll = await http
    .get<DTO.AlumnoDTO[]>("/api/alumnos")
    .then((r) => r.data ?? []);

  const alumnoToPersona = new Map<number, number>();
  for (const a of alumnosAll as any[]) {
    if (a?.id != null && a?.personaId != null)
      alumnoToPersona.set(a.id, a.personaId);
  }

  // 5) Resolver nombres por persona (si existe endpoint; si no, vacío)
  const personaCache = new Map<number, { nombre: string; apellido: string }>();
  async function nombre(pid?: number) {
    if (!pid) return "";
    if (personaCache.has(pid)) {
      const p = personaCache.get(pid)!;
      return `${p.apellido}, ${p.nombre}`.trim();
    }
    try {
      const p = await http
        .get<DTO.PersonaDTO>(`/api/personas/${pid}`)
        .then((r) => r.data);
      const out = {
        nombre: (p as any)?.nombre ?? "",
        apellido: (p as any)?.apellido ?? "",
      };
      personaCache.set(pid, out);
      return `${out.apellido}, ${out.nombre}`.trim();
    } catch {
      return ""; // si tu back no tiene GET /api/personas/{id}, no rompemos
    }
  }

  // 6) Componer AlumnoLiteDTO[]
  const out: DTO.AlumnoLiteDTO[] = [];
  for (const m of matsOk as any[]) {
    const alumnoId = m.alumnoId ?? m.alumno?.id;
    if (!alumnoId) continue;
    const personaId = alumnoToPersona.get(alumnoId);
    const nombreCompleto = (await nombre(personaId)) || `Alumno #${alumnoId}`;
    out.push({
      matriculaId: m.id,
      alumnoId,
      nombreCompleto,
    });
  }
  return out;
}

export const secciones = {
  list: () => http.get<DTO.SeccionDTO[]>("/api/secciones"),
  byId: (id: number) => http.get<DTO.SeccionDTO>("/api/secciones/" + id),
  create: (body: DTO.SeccionCreateDTO) =>
    http.post<number>("/api/secciones", body),
  update: (id: number, body: DTO.SeccionDTO) =>
    http.put<void>("/api/secciones/" + id, body),
  delete: (id: number) => http.delete<void>("/api/secciones/" + id),

  // ✅ admite fecha opcional. Si 500/LAZY o viene [], reconstruimos por historial+matricula+alumno.
  alumnos: async (id: number, fecha?: string) => {
    try {
      const config = fecha ? { params: { fecha } } : undefined;
      const res = await http.get<DTO.AlumnoLiteDTO[]>(
        `/api/secciones/${id}/alumnos`,
        config,
      );
      if (Array.isArray(res.data) && res.data.length > 0) return res;
      const data = await rosterViaHistorial(id);
      return { data } as { data: DTO.AlumnoLiteDTO[] };
    } catch (e: any) {
      if (isLazyOr500(e)) {
        const data = await rosterViaHistorial(id);
        return { data } as { data: DTO.AlumnoLiteDTO[] };
      }
      throw e;
    }
  },
};

export const seccionesAlumnos = {
  bySeccionId: (id: number, fecha?: string) => secciones.alumnos(id, fecha),
};
