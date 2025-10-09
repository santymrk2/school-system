"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LoadingState from "@/components/common/LoadingState";
import { gestionAcademica } from "@/services/api/modules";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CierrePrimarioView from "./_views/CierrePrimarioView";
import InformeInicialView from "./_views/InformeInicialView";
import { useViewerScope } from "@/hooks/scope/useViewerScope";
import { useScopedSecciones } from "@/hooks/scope/useScopedSecciones";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod";
import { UserRole } from "@/types/api-generated";

export default function CalificacionesSeccionPage() {
  const { id } = useParams<{ id: string }>();
  const seccionId = Number(id);
  const router = useRouter();
  const { type, activeRole } = useViewerScope();
  const { loading: scopedLoading, secciones: accesibles } = useScopedSecciones();
  const { getPeriodoNombre } = useActivePeriod();
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
      
        <div className="p-6 text-sm">
          403 — El perfil de Administración no tiene acceso a Calificaciones.
        </div>
      
    );
  }

  if (accessStatus === "forbidden") {
    return (
      
        <div className="p-6 text-sm">403 — No tenés acceso a esta sección.</div>
      
    );
  }

  if (accessStatus === "checking") {
    return (
      
        <div className="p-6">
          <LoadingState label="Verificando acceso a la sección…" />
        </div>
      
    );
  }

  if (accessStatus === "notAssigned") {
    return (
      
        <div className="p-6 text-sm">
          403 — Esta sección no pertenece a tus asignaciones.
        </div>
      
    );
  }

  const heading =
    nivel === "PRIMARIO" ? "Calificación Trimestral" : "Informes de Inicial";
  const sectionLabel = seccion
    ? `${seccion.gradoSala ?? ""} ${seccion.division ?? ""}`.trim()
    : `Sección #${seccionId}`;
  const periodoNombre = getPeriodoNombre(
    seccion?.periodoEscolarId,
    ((seccion as any)?.periodoEscolar ?? null) as { anio?: number } | null,
  );

  const formatTurnoLabel = (turno?: string | null) => {
    if (!turno) return null;
    const map: Record<string, string> = { MANANA: "Mañana", TARDE: "Tarde" };
    const normalized = map[String(turno).toUpperCase()] ?? turno;
    return `Turno ${normalized}`;
  };
  const turnoLabel = formatTurnoLabel(seccion?.turno);

  return (
    <div className="p-4 md:p-8 space-y-4">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/calificaciones")}
        >
          Volver
        </Button>
        <div>
          <h2 className="text-2xl font-semibold">{heading}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{sectionLabel}</Badge>
            {turnoLabel && <Badge variant="outline">{turnoLabel}</Badge>}
            {seccion?.periodoEscolarId && (
              <Badge variant="outline">
                Período {periodoNombre ?? "—"}
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
    
  );
}
