"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/app/dashboard/dashboard-layout";
import LoadingState from "@/components/common/LoadingState";
import { gestionAcademica } from "@/services/api/modules";
import { Badge } from "@/components/ui/badge";
import CierrePrimarioView from "./_views/CierrePrimarioView";
import InformeInicialView from "./_views/InformeInicialView";
import { useViewerScope } from "@/hooks/scope/useViewerScope";
import { useScopedSecciones } from "@/hooks/scope/useScopedSecciones";
import { UserRole } from "@/types/api-generated";

export default function CalificacionesSeccionPage() {
  const { id } = useParams<{ id: string }>();
  const seccionId = Number(id);
  const { type, activeRole } = useViewerScope();
  const { loading: scopedLoading, secciones: accesibles } = useScopedSecciones();
  const isAdmin = activeRole === UserRole.ADMIN;
  const isTeacher = type === "teacher";
  const isStaff = type === "staff";
  const teacherHasAccess = useMemo(() => {
    if (!isTeacher) return true;
    return accesibles.some((s) => s.id === seccionId);
  }, [accesibles, isTeacher, seccionId]);
  const [loading, setLoading] = useState(true);
  const [seccion, setSeccion] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const accessStatus = useMemo(
    () => {
      if (isAdmin) return "admin" as const;
      if (!isTeacher && !isStaff) return "forbidden" as const;
      if (isTeacher && scopedLoading) return "checking" as const;
      if (isTeacher && !teacherHasAccess) return "notAssigned" as const;
      return "ok" as const;
    },
    [
      isAdmin,
      isTeacher,
      isStaff,
      scopedLoading,
      teacherHasAccess,
    ],
  );

  useEffect(() => {
    if (accessStatus !== "ok") return;

    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await gestionAcademica.secciones.list();
        if (!alive) return;
        setSeccion((data ?? []).find((x: any) => x.id === seccionId) ?? null);
      } catch (e: any) {
        if (alive) setError(e?.message ?? "No se pudo cargar la sección");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [accessStatus, seccionId]);

  const nivel = useMemo(
    () => (seccion?.nivel ?? "").toUpperCase() as "PRIMARIO" | "INICIAL" | "",
    [seccion],
  );

  if (accessStatus === "admin") {
    return (
      <DashboardLayout>
        <div className="p-6 text-sm">
          403 — El perfil de Administración no tiene acceso a Calificaciones.
        </div>
      </DashboardLayout>
    );
  }

  if (accessStatus === "forbidden") {
    return (
      <DashboardLayout>
        <div className="p-6 text-sm">403 — No tenés acceso a esta sección.</div>
      </DashboardLayout>
    );
  }

  if (accessStatus === "checking") {
    return (
      <DashboardLayout>
        <div className="p-6">
          <LoadingState label="Verificando acceso a la sección…" />
        </div>
      </DashboardLayout>
    );
  }

  if (accessStatus === "notAssigned") {
    return (
      <DashboardLayout>
        <div className="p-6 text-sm">
          403 — Esta sección no pertenece a tus asignaciones.
        </div>
      </DashboardLayout>
    );
  }

  const heading =
    nivel === "PRIMARIO" ? "Calificación Trimestral" : "Informes de Inicial";
  const sectionLabel = seccion
    ? `${seccion.gradoSala ?? ""} ${seccion.division ?? ""}`.trim()
    : `Sección #${seccionId}`;

  const formatTurnoLabel = (turno?: string | null) => {
    if (!turno) return null;
    const map: Record<string, string> = { MANANA: "Mañana", TARDE: "Tarde" };
    const normalized = map[String(turno).toUpperCase()] ?? turno;
    return `Turno ${normalized}`;
  };
  const turnoLabel = formatTurnoLabel(seccion?.turno);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">{heading}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{sectionLabel}</Badge>
            {turnoLabel && <Badge variant="outline">{turnoLabel}</Badge>}
            {seccion?.periodoEscolarId && (
              <Badge variant="outline">
                Período {seccion.periodoEscolarId}
              </Badge>
            )}
          </div>
        </div>

        {loading && <LoadingState label="Cargando sección…" />}
        {error && <div className="text-sm text-red-600">{error}</div>}

        {!loading && !error && (
          <>
            {nivel === "PRIMARIO" ? (
              <CierrePrimarioView
                seccionId={seccionId}
                periodoEscolarId={seccion?.periodoEscolarId ?? null}
              />
            ) : (
              <InformeInicialView
                seccionId={seccionId}
                periodoEscolarId={seccion?.periodoEscolarId ?? null}
              />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
