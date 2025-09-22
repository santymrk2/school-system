"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingState from "@/components/common/LoadingState";
import { DashboardLayout } from "@/app/dashboard/dashboard-layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useViewerScope } from "@/hooks/scope/useViewerScope";
import { useScopedIndex } from "@/hooks/scope/useScopedIndex";
import FamilyMateriasView from "@/app/dashboard/materias/_components/FamilyMateriasView";
import type { SeccionDTO, NivelAcademico } from "@/types/api-generated";
import { UserRole } from "@/types/api-generated";

function fmtSeccion(s: SeccionDTO) {
  const base =
    `${s.gradoSala ?? ""} ${s.division ?? ""}`.trim() || `Sección #${s.id}`;
  return base;
}

function formatTurnoLabel(turno?: string | null) {
  if (!turno) return "—";
  const map: Record<string, string> = { MANANA: "Mañana", TARDE: "Tarde" };
  return map[String(turno).toUpperCase()] ?? turno;
}

function isPrimario(s: SeccionDTO) {
  const n = (s.nivel as NivelAcademico | undefined) ?? (s as any).nivel;
  if (n) return String(n).toUpperCase() === "PRIMARIO";
  const gs = `${s.gradoSala ?? ""}`.toLowerCase();
  return !gs.includes("sala");
}

export default function MateriasPage() {
  const router = useRouter();
  const { activeRole } = useViewerScope();
  const {
    scope,
    loading,
    error,
    secciones,
    hijos,
    periodoEscolarId,
    titularBySeccionId,
  } = useScopedIndex({ includeTitularSec: true });

  const [q, setQ] = useState("");

  const isAdmin = activeRole === UserRole.ADMIN;

  if (scope === "family" || scope === "student") {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              {scope === "student" ? "Mis docentes" : "Docentes y materias"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {scope === "student"
                ? "Consultá tus docentes y materias asignadas."
                : "Seleccioná a cada hijo para conocer a sus docentes y materias."}
            </p>
          </div>

          <FamilyMateriasView
            alumnos={hijos}
            initialLoading={loading}
            initialError={error ? String(error) : null}
          />
        </div>
      </DashboardLayout>
    );
  }

  if (isAdmin) {
    return (
      <DashboardLayout>
        <div className="p-6 text-sm">
          403 — El perfil de Administración no tiene acceso a Materias.
        </div>
      </DashboardLayout>
    );
  }

  if (scope !== "staff" && scope !== "teacher") {
    return (
      <DashboardLayout>
        <div className="p-6 text-sm">
          403 — No tenés acceso a la gestión de materias.
        </div>
      </DashboardLayout>
    );
  }

  const seccionesPrimario = useMemo(() => {
    return (secciones ?? []).filter(isPrimario);
  }, [secciones]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return seccionesPrimario;
    return seccionesPrimario.filter((s) =>
      `${fmtSeccion(s)} ${s.turno ?? ""}`.toLowerCase().includes(term),
    );
  }, [q, seccionesPrimario]);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Materias</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline">Primario</Badge>
              {periodoEscolarId && (
                <Badge variant="outline">Período {periodoEscolarId}</Badge>
              )}
            </div>
          </div>
          <div className="w-full max-w-sm">
            <Input
              placeholder="Buscar sección…"
              value={q}
              onChange={(event) => setQ(event.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <LoadingState label="Cargando secciones…" />
        ) : error ? (
          <div className="text-sm text-red-600">{String(error)}</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => {
              const titular = titularBySeccionId.get(s.id);
              return (
                <Card
                  key={s.id}
                  className="cursor-pointer transition-shadow hover:border-primary/60 hover:shadow-md"
                  onClick={() => router.push(`/dashboard/materias/seccion/${s.id}`)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <span>{fmtSeccion(s)}</span>
                      <Badge variant="secondary">{formatTurnoLabel(s.turno)}</Badge>
                    </CardTitle>
                    <CardDescription>
                      {titular
                        ? `Titular: ${titular}`
                        : "Gestioná materias y docentes"}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
            {!filtered.length && (
              <div className="text-sm text-muted-foreground">
                No hay secciones disponibles.
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
