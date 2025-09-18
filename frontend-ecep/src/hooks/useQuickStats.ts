// src/hooks/useQuickStats.ts
"use client";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod";

export type QuickStats = {
  alumnosActivos: number;
  docentesActivos: number;
  postulacionesPendientes: number;
  licenciasActivas: number;
  actasSinFirmar: number;
};

function inRangeISO(
  todayISO: string,
  from?: string | null,
  to?: string | null,
) {
  // Comparación lexicográfica segura para YYYY-MM-DD
  const t = todayISO;
  const okFrom = !from || t >= from;
  const okTo = !to || t <= to;
  return okFrom && okTo;
}

function getPeriodoIdSafe(s: any): number | undefined {
  // Acepta varias formas según DTOs viejos/nuevos
  return (
    s?.periodoEscolarId ??
    s?.periodoId ??
    s?.periodoEscolar?.id ??
    s?.periodo?.id
  );
}

export function useQuickStats() {
  const { periodoEscolarId, hoyISO } = useActivePeriod();
  const [data, setData] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    if (!periodoEscolarId || !hoyISO) return;

    (async () => {
      try {
        setLoading(true);

        // ========= Alumnos activos (por secciones del período, deduplicando) =========
        const seccionesRes = await api.secciones
          .list()
          .catch(() => ({ data: [] as any[] }));
        const seccionesAll = seccionesRes.data ?? [];
        const seccionesPeriodo = seccionesAll.filter(
          (s) => getPeriodoIdSafe(s) === periodoEscolarId,
        );

        // OJO: acá estaba el fallo: ¡hay que usar seccionesAlumnos.bySeccionId!
        const alumnosLists = await Promise.all(
          seccionesPeriodo.map((s: any) =>
            api.seccionesAlumnos
              .bySeccionId(s.id, hoyISO) // <--- endpoint correcto de tu servicio
              .then((r) => r.data ?? [])
              .catch(() => []),
          ),
        );

        const alumnosSet = new Set<number>();
        for (const arr of alumnosLists) {
          for (const a of arr as any[]) {
            // Soporta AlumnoLiteDTO nuevo o algún DTO viejo
            const id = a.alumnoId ?? a.id;
            if (id != null) alumnosSet.add(id);
          }
        }

        // ========= Docentes activos hoy (asignaciones vigentes) =========
        const asigResp = await api.asignacionDocenteSeccion
          .list()
          .catch(() => ({ data: [] as any[] }));
        const asigs = asigResp.data ?? [];
        const docentes = new Set<number>();
        for (const a of asigs as any[]) {
          const vd = a.vigenciaDesde ?? a.desde;
          const vh = a.vigenciaHasta ?? a.hasta;
          if (inRangeISO(hoyISO, vd, vh)) {
            const eid = a.empleadoId ?? a.personalId ?? a.docenteId;
            if (eid != null) docentes.add(eid);
          }
        }

        // ========= Postulaciones pendientes (si el módulo existe) =========
        let postulPend = 0;
        if (api.solicitudesAdmision?.list) {
          const sol =
            (await api.solicitudesAdmision.list().catch(() => ({ data: [] })))
              .data ?? [];
          postulPend = sol.filter((s: any) =>
            String(s.estado ?? "")
              .toUpperCase()
              .includes("PEND"),
          ).length;
        }

        // ========= Licencias activas hoy =========
        const licRes = await api.licencias
          .list()
          .catch(() => ({ data: [] as any[] }));
        const lic = licRes.data ?? [];
        const licAct = lic.filter((l: any) => {
          const d = l.desde ?? l.fechaInicio ?? l.inicio;
          const h = l.hasta ?? l.fechaFin ?? l.fin;
          return inRangeISO(hoyISO, d, h);
        }).length;

        // ========= Actas de accidente sin firmar (BORRADOR) =========
        const actasRes = await api.actasAccidente
          .list()
          .catch(() => ({ data: [] as any[] }));
        const actas = actasRes.data ?? [];
        const sinFirmar = actas.filter(
          (a: any) => String(a.estado ?? "").toUpperCase() === "BORRADOR",
        ).length;

        if (!alive) return;
        setData({
          alumnosActivos: alumnosSet.size,
          docentesActivos: docentes.size,
          postulacionesPendientes: postulPend,
          licenciasActivas: licAct,
          actasSinFirmar: sinFirmar,
        });
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [periodoEscolarId, hoyISO]);

  return { data, loading };
}
