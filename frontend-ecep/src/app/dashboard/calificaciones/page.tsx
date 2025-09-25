"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingState from "@/components/common/LoadingState";
import { DashboardLayout } from "@/app/dashboard/dashboard-layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useViewerScope } from "@/hooks/scope/useViewerScope";
import { useScopedIndex } from "@/hooks/scope/useScopedIndex";
import FamilyCalificacionesView from "@/app/dashboard/calificaciones/_components/FamilyCalificacionesView";
import type { NivelAcademico, SeccionDTO } from "@/types/api-generated";
import { UserRole } from "@/types/api-generated";

function isPrimario(seccion: SeccionDTO) {
  const nivel = (seccion.nivel as NivelAcademico | undefined) ?? (seccion as any).nivel;
  if (nivel) return String(nivel).toUpperCase() === "PRIMARIO";
  const nombre = `${seccion.gradoSala ?? ""}`.toLowerCase();
  return !nombre.includes("sala");
}

function isInicial(seccion: SeccionDTO) {
  const nivel = (seccion.nivel as NivelAcademico | undefined) ?? (seccion as any).nivel;
  if (nivel) return String(nivel).toUpperCase() === "INICIAL";
  const nombre = `${seccion.gradoSala ?? ""}`.toLowerCase();
  return nombre.includes("sala");
}

function formatTurnoLabel(turno?: string | null) {
  if (!turno) return "—";
  const map: Record<string, string> = { MANANA: "Mañana", TARDE: "Tarde" };
  return map[String(turno).toUpperCase()] ?? turno;
}

export default function CalificacionesIndexPage() {
  const router = useRouter();
  const { activeRole } = useViewerScope();
  const {
    scope,
    loading,
    error,
    secciones,
    hijos,
    periodoEscolarId,
    periodoNombre,
    getPeriodoNombre,
  } = useScopedIndex({ includeTitularSec: true });

  const isAdmin = activeRole === UserRole.ADMIN;

  if (scope === "family" || scope === "student") {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              {scope === "student" ? "Mis calificaciones" : "Calificaciones"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {scope === "student"
                ? "Consultá tus calificaciones finales y los informes de cada trimestre."
                : "Seleccioná a cada hijo para revisar sus calificaciones e informes."}
            </p>
          </div>
          <FamilyCalificacionesView
            alumnos={hijos}
            initialLoading={loading}
            initialError={error ? String(error) : null}
            periodoEscolarId={periodoEscolarId}
            getPeriodoNombre={getPeriodoNombre}
          />
        </div>
      </DashboardLayout>
    );
  }

  if (isAdmin) {
    return (
      <DashboardLayout>
        <div className="p-6 text-sm">
          403 — El perfil de Administración no tiene acceso a Calificaciones.
        </div>
      </DashboardLayout>
    );
  }

  const isTeacher = scope === "teacher";
  const isStaff = scope === "staff";

  if (!isTeacher && !isStaff) {
    return (
      <DashboardLayout>
        <div className="p-6 text-sm">403 — No tenés acceso a calificaciones.</div>
      </DashboardLayout>
    );
  }

  const primario = useMemo(
    () => (secciones ?? []).filter(isPrimario),
    [secciones],
  );
  const inicial = useMemo(
    () => (secciones ?? []).filter(isInicial),
    [secciones],
  );

  const [tab, setTab] = useState<"primario" | "inicial">("primario");

  useEffect(() => {
    if (loading) return;
    if (!primario.length && inicial.length) {
      setTab("inicial");
    } else if (!inicial.length && primario.length) {
      setTab("primario");
    }
  }, [loading, primario.length, inicial.length]);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Calificaciones</h2>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">
              Primario: {loading ? "—" : primario.length}
            </Badge>
            <Badge variant="outline">
              Inicial: {loading ? "—" : inicial.length}
            </Badge>
            {periodoNombre && (
              <Badge variant="outline">Período {periodoNombre}</Badge>
            )}
          </div>
        </div>

        {loading ? (
          <LoadingState label="Cargando secciones…" />
        ) : error ? (
          <div className="text-sm text-red-600">{String(error)}</div>
        ) : (
          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as "primario" | "inicial")}
            className="space-y-4"
          >
            <TabsList className="justify-start overflow-x-auto">
              <TabsTrigger value="primario">Primario</TabsTrigger>
              <TabsTrigger value="inicial">Inicial</TabsTrigger>
            </TabsList>

            <TabsContent value="primario" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Gestión de calificaciones trimestrales por materia.
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {primario.map((seccion) => (
                  <Card
                    key={seccion.id}
                    className="cursor-pointer transition-colors hover:border-primary"
                    onClick={() =>
                      router.push(`/dashboard/calificaciones/seccion/${seccion.id}`)
                    }
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-lg">
                        <span>
                          {seccion.gradoSala} {seccion.division}
                        </span>
                        <Badge variant="secondary">
                          {formatTurnoLabel(seccion.turno)}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Calificaciones finales y cierres trimestrales.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
              {!primario.length && (
                <div className="text-sm text-muted-foreground">
                  No hay secciones de Primario disponibles.
                </div>
              )}
            </TabsContent>

            <TabsContent value="inicial" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Seguimiento de informes cualitativos por trimestre.
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {inicial.map((seccion) => (
                  <Card
                    key={seccion.id}
                    className="cursor-pointer transition-colors hover:border-primary"
                    onClick={() =>
                      router.push(`/dashboard/calificaciones/seccion/${seccion.id}`)
                    }
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-lg">
                        <span>
                          {seccion.gradoSala} {seccion.division}
                        </span>
                        <Badge variant="secondary">
                          {formatTurnoLabel(seccion.turno)}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Informes descriptivos por trimestre.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
              {!inicial.length && (
                <div className="text-sm text-muted-foreground">
                  No hay secciones de Inicial disponibles.
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
