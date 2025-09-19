"use client";

import { useEffect, useMemo, useState } from "react";
import LoadingState from "@/components/common/LoadingState";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/dashboard/dashboard-layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useViewerScope } from "@/hooks/scope/useViewerScope";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod";
import { api } from "@/services/api";
import type { SeccionDTO, NivelAcademico } from "@/types/api-generated";

type Seccion = SeccionDTO;

function fmtSeccion(s: Seccion) {
  const base =
    `${s.gradoSala ?? ""} ${s.division ?? ""}`.trim() || `Sección #${s.id}`;
  return base;
}

function formatTurnoLabel(turno?: string | null) {
  if (!turno) return "—";
  const map: Record<string, string> = { MANANA: "Mañana", TARDE: "Tarde" };
  return map[String(turno).toUpperCase()] ?? turno;
}

function isPrimario(s: Seccion) {
  const n = (s.nivel as NivelAcademico | undefined) ?? (s as any).nivel;
  if (n) return String(n).toUpperCase() === "PRIMARIO";
  // fallback por si falta `nivel`
  const gs = `${s.gradoSala ?? ""}`.toLowerCase();
  return !gs.includes("sala");
}

export default function MateriasPage() {
  const router = useRouter();
  const { roles } = useViewerScope();
  const { periodoEscolarId } = useActivePeriod();

  const isDirector = roles.includes("DIRECTOR");
  const isSecret = roles.includes("SECRETARY");
  const isAdmin = roles.includes("ADMIN");
  if (!isDirector && !isSecret && !isAdmin) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Acceso restringido</CardTitle>
              <CardDescription>
                Solo Dirección / Secretaría / Admin
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [secciones, setSecciones] = useState<Seccion[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.secciones.list();
        const all: Seccion[] = res.data ?? [];
        const delPeriodo = periodoEscolarId
          ? all.filter(
              (s: any) =>
                (s.periodoEscolarId ?? (s as any).periodoId) ===
                periodoEscolarId,
            )
          : all;
        const primario = delPeriodo.filter(isPrimario);
        if (alive) setSecciones(primario);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [periodoEscolarId]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return secciones;
    return secciones.filter((s) => fmtSeccion(s).toLowerCase().includes(t));
  }, [q, secciones]);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between gap-3">
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
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <LoadingState label="Cargando secciones…" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => (
              <Card
                key={s.id}
                className="hover:shadow-md transition-shadow"
                onClick={() =>
                  router.push(`/dashboard/materias/seccion/${s.id}`)
                }
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>{fmtSeccion(s)}</span>
                    <Badge variant="secondary">
                      {formatTurnoLabel(s.turno)}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="pb-3">
                    Gestioná las materias y docentes
                  </CardDescription>
                </CardHeader>
                {/*
                <CardContent className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(`/dashboard/materias/seccion/${s.id}`)
                    }
                  >
                    Ver materias
                  </Button>
                </CardContent>
                */}
              </Card>
            ))}
            {!filtered.length && (
              <div className="text-sm text-muted-foreground">
                No hay secciones.
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
