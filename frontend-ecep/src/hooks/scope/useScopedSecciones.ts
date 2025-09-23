// src/hooks/useScopedSecciones.ts
"use client";

import { useEffect, useState } from "react";
import { gestionAcademica, identidad } from "@/services/api/modules";
import { useViewerScope } from "./useViewerScope";
import type {
  SeccionDTO,
  AsignacionDocenteSeccionDTO,
  EmpleadoDTO,
  PersonaDTO,
} from "@/types/api-generated";

function vigente(
  desde?: string | null,
  hasta?: string | null,
  hoyISO?: string,
) {
  const today = hoyISO ?? new Date().toISOString().slice(0, 10);
  return (!desde || today >= desde) && (!hasta || today <= hasta);
}

export function useScopedSecciones(opts?: {
  fecha?: string;
  periodoEscolarId?: number;
  includeTitular?: boolean;
}) {
  const { type, personaId } = useViewerScope();
  const fecha = opts?.fecha ?? new Date().toISOString().slice(0, 10);
  const periodoEscolarId = opts?.periodoEscolarId;
  const includeTitular = !!opts?.includeTitular;

  const [loading, setLoading] = useState(true);
  const [secciones, setSecciones] = useState<SeccionDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [titularBySeccionId, setTitularBySeccionId] = useState<
    Map<number, string>
  >(new Map());

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // STAFF → todas las secciones (opcional: filtrar por período)
        if (type === "staff") {
          const [secs, asig, empleados] = await Promise.all([
            gestionAcademica.secciones.list().then((r) => r.data ?? []),
            includeTitular
              ? gestionAcademica.asignacionDocenteSeccion.list().then((r) => r.data ?? [])
              : Promise.resolve([]),
            includeTitular
              ? identidad.empleados.list().then((r) => r.data ?? [])
              : Promise.resolve([]),
          ]);

          // Si pedimos titular, mapear empleadoId -> nombre completo (via Persona)
          if (includeTitular) {
            const personaCache = new Map<number, PersonaDTO>();
            const nombreEmpleado = async (emp: EmpleadoDTO) => {
              if (!emp.personaId) return "";
              if (!personaCache.has(emp.personaId)) {
                const p = await identidad.personasCore
                  .getById(emp.personaId)
                  .then((r) => r.data as PersonaDTO);
                personaCache.set(emp.personaId, p);
              }
              const p = personaCache.get(emp.personaId)!;
              return `${p.apellido ?? ""} ${p.nombre ?? ""}`.trim();
            };

            const map = new Map<number, string>();
            for (const a of asig as AsignacionDocenteSeccionDTO[]) {
              const rol = String((a as any).rol ?? "").toUpperCase();
              if (rol !== "MAESTRO_TITULAR") continue;
              if (
                !vigente(
                  (a as any).vigenciaDesde,
                  (a as any).vigenciaHasta,
                  fecha,
                )
              )
                continue;

              const sid = (a as any).seccionId ?? (a as any).seccion?.id;
              const eid =
                (a as any).empleadoId ??
                (a as any).personalId ??
                (a as any).docenteId;
              if (!sid || !eid) continue;

              const emp = (empleados as EmpleadoDTO[]).find(
                (e) => e.id === eid,
              );
              if (emp) map.set(sid, await nombreEmpleado(emp));
            }
            if (alive) setTitularBySeccionId(map);
          }

          let filtradas = secs;
          if (periodoEscolarId != null) {
            filtradas = filtradas.filter(
              (s: any) =>
                (s.periodoEscolarId ?? s.periodoId ?? s.periodoEscolar?.id) ===
                periodoEscolarId,
            );
          }

          if (alive) setSecciones(filtradas);
          return;
        }

        // TEACHER → asignaciones del docente/empleado (vigentes en fecha)
        if (type === "teacher") {
          if (!personaId) {
            if (alive) setSecciones([]);
            return;
          }

          // 1) resolver empleadoId desde personaId
          const empleadosRes = await identidad.empleados
            .list()
            .catch(() => ({ data: [] as EmpleadoDTO[] }));
          const empleado = (empleadosRes.data ?? []).find(
            (e) => e.personaId === personaId,
          );
          const empleadoId = empleado?.id;
          if (!empleadoId) {
            if (alive) setSecciones([]);
            return;
          }

          // 2) traer asignaciones (endpoint by-empleado si existe)
          let asigs: AsignacionDocenteSeccionDTO[] = [];
          if ((gestionAcademica.asignacionDocenteSeccion as any).byEmpleadoVigentes) {
            const r = await (
              gestionAcademica.asignacionDocenteSeccion as any
            ).byEmpleadoVigentes(empleadoId, fecha);
            asigs = r.data ?? [];
          } else {
            const r = await gestionAcademica.asignacionDocenteSeccion.list();
            const todos = r.data ?? [];
            asigs = todos.filter(
              (a: any) =>
                (a.empleadoId ?? a.personalId ?? a.docenteId) === empleadoId &&
                vigente(
                  (a as any).vigenciaDesde,
                  (a as any).vigenciaHasta,
                  fecha,
                ),
            );
          }

          const ids = Array.from(
            new Set(
              asigs
                .map((a: any) => a.seccionId ?? a.seccion?.id)
                .filter(Boolean),
            ),
          ) as number[];

          if (ids.length === 0) {
            if (alive) setSecciones([]);
            return;
          }

          let secs = (await gestionAcademica.secciones.list()).data ?? [];
          secs = secs.filter((s) => ids.includes(s.id));

          if (periodoEscolarId != null) {
            secs = secs.filter(
              (s: any) =>
                (s.periodoEscolarId ?? s.periodoId ?? s.periodoEscolar?.id) ===
                periodoEscolarId,
            );
          }

          if (alive) setSecciones(secs);
          return;
        }

        // FAMILY / GUEST
        if (alive) setSecciones([]);
      } catch (e: any) {
        if (alive) setError(e?.message ?? "Error cargando secciones");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [type, personaId, fecha, periodoEscolarId, includeTitular]);

  return { loading, error, secciones, titularBySeccionId };
}
