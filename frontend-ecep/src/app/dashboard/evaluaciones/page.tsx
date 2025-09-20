"use client";

import { useEffect, useMemo, useState } from "react";
import LoadingState from "@/components/common/LoadingState";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/dashboard/dashboard-layout";
import { api } from "@/services/api";
import type {
  SeccionDTO,
  SeccionMateriaDTO,
  MateriaDTO,
  EvaluacionDTO,
  NivelAcademico,
} from "@/types/api-generated";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod";
import { useScopedIndex } from "@/hooks/scope/useScopedIndex";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ActiveTrimestreBadge } from "@/app/dashboard/_components/ActiveTrimestreBadge";
import FamilyEvaluationsView from "@/app/dashboard/evaluaciones/_components/FamilyEvaluationsView";

function isPrimario(s: SeccionDTO): boolean {
  const n = (s as any)?.nivel as NivelAcademico | undefined;
  if (n) return n === "PRIMARIO";
  const gs = String((s as any)?.gradoSala ?? "").toLowerCase();
  return !gs.includes("sala");
}

function formatTurnoLabel(turno?: string | null) {
  if (!turno) return "—";
  const map: Record<string, string> = { MANANA: "Mañana", TARDE: "Tarde" };
  return map[String(turno).toUpperCase()] ?? turno;
}

export default function EvaluacionesIndexPage() {
  const router = useRouter();
  const { periodoEscolarId } = useActivePeriod();

  // Del scope: trae secciones visibles según rol (staff/teacher/family).
  // Evaluaciones solo aplica a staff/teacher -> family no aparece acá.
  const {
    scope,
    loading: loadingScope,
    error: errorScope,
    secciones,
    titularBySeccionId,
    hijos,
  } = useScopedIndex({ includeTitularSec: true });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [secMats, setSecMats] = useState<SeccionMateriaDTO[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionDTO[]>([]);
  const [materias, setMaterias] = useState<MateriaDTO[]>([]);

  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setError(null);
        setLoading(true);
        const [sms, evs, mats] = await Promise.all([
          api.seccionMaterias.list().then((r) => r.data ?? []),
          api.evaluaciones.list().then((r) => r.data ?? []),
          api.materias.list().then((r) => r.data ?? []),
        ]);
        if (!alive) return;
        setSecMats(sms);
        setEvaluaciones(evs);
        setMaterias(mats);
      } catch (e: any) {
        if (alive) setError(e?.message ?? "No se pudo cargar la información.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Filtramos secciones del scope por Primario y (si corresponde) por período activo
  const seccionesPrimario = useMemo(() => {
    const base = (secciones ?? []).filter(isPrimario);
    if (!periodoEscolarId) return base;
    return base.filter((s) => (s as any).periodoEscolarId === periodoEscolarId);
  }, [secciones, periodoEscolarId]);

  // seccionId -> seccionMateriaIds
  const smIdsBySeccion = useMemo(() => {
    const map = new Map<number, number[]>();
    for (const sm of secMats) {
      const sid = (sm as any).seccionId as number;
      const arr = map.get(sid) ?? [];
      arr.push(sm.id);
      map.set(sid, arr);
    }
    return map;
  }, [secMats]);

  // materiaId -> nombre
  const materiaNombreById = useMemo(() => {
    const m = new Map<number, string>();
    for (const it of materias) m.set(it.id, it.nombre);
    return m;
  }, [materias]);

  // seccionId -> count evaluaciones
  const evalCountBySeccion = useMemo(() => {
    const map = new Map<number, number>();
    const smToSeccion = new Map<number, number>();
    for (const sm of secMats) smToSeccion.set(sm.id, (sm as any).seccionId);
    for (const e of evaluaciones) {
      const sid = smToSeccion.get((e as any).seccionMateriaId);
      if (!sid) continue;
      map.set(sid, (map.get(sid) ?? 0) + 1);
    }
    return map;
  }, [secMats, evaluaciones]);

  // Búsqueda global
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return seccionesPrimario;

    return seccionesPrimario.filter((s) => {
      const base =
        `${s.gradoSala ?? ""} ${s.division ?? ""} ${s.turno ?? ""}`.toLowerCase();
      if (base.includes(term)) return true;

      // Materias/evaluaciones: si hay evals de esta sección y alguna coincide por título o materia
      const smIds = smIdsBySeccion.get(s.id) ?? [];
      const evs = evaluaciones.filter((e) =>
        smIds.includes((e as any).seccionMateriaId),
      );
      return evs.some((e) => {
        const tema = String((e as any).tema ?? "").toLowerCase();
        if (tema.includes(term)) return true;
        const matId = (e as any).seccionMateriaId
          ? (secMats.find((x) => x.id === (e as any).seccionMateriaId) as any)
              ?.materiaId
          : undefined;
        const matNom = matId ? (materiaNombreById.get(matId) ?? "") : "";
        return matNom.toLowerCase().includes(term);
      });
    });
  }, [
    q,
    seccionesPrimario,
    smIdsBySeccion,
    evaluaciones,
    secMats,
    materiaNombreById,
  ]);

  if (scope === "family" || scope === "student") {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                {scope === "student" ? "Mis evaluaciones" : "Evaluaciones"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Consultá calificaciones y observaciones de las materias
                cursadas.
              </p>
              <ActiveTrimestreBadge className="mt-2" />
            </div>
          </div>

          <FamilyEvaluationsView
            alumnos={hijos}
            scope={scope}
            initialLoading={loadingScope}
            initialError={errorScope ? String(errorScope) : null}
          />
        </div>
      </DashboardLayout>
    );
  }

  const title = scope === "teacher" ? "Exámenes" : "Exámenes";

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline">Primario</Badge>
              <Badge variant="outline">Período {periodoEscolarId ?? "—"}</Badge>
            </div>
            <ActiveTrimestreBadge className="mt-2" />
          </div>
        </div>

        {(loading || loadingScope) && (
          <LoadingState label="Cargando evaluaciones…" />
        )}
        {(error || errorScope) && (
          <div className="text-sm text-red-600">
            {String(error ?? errorScope)}
          </div>
        )}

        {!loading && !loadingScope && !error && !errorScope && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((s) => {
              const titular = titularBySeccionId.get(s.id);
              const count = evalCountBySeccion.get(s.id) ?? 0;
              return (
                <Card
                  key={s.id}
                  className="hover:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow cursor-pointer"
                  onClick={() =>
                    router.push(`/dashboard/evaluaciones/seccion/${s.id}`)
                  }
                  title="Abrir sección"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <span>
                        {s.gradoSala} {s.division}
                      </span>
                      <Badge variant="secondary">
                        {formatTurnoLabel(s.turno)}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {titular ? `Titular: ${titular}` : "Sin titular asignado"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">
                      {count
                        ? `${count} evaluación${count === 1 ? "" : "es"}`
                        : "Sin evaluaciones"}
                    </span>
                    {/*
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(event) => {
                        event.stopPropagation();
                        router.push(`/dashboard/evaluaciones/seccion/${s.id}`);
                      }}
                    >
                      Ver sección
                    </Button>
                    */}
                  </CardContent>
                </Card>
              );
            })}

            {!filtered.length && (
              <div className="text-sm text-muted-foreground">
                No hay secciones que coincidan con el filtro.
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
