"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/app/dashboard/dashboard-layout";
import { api } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import CierrePrimarioView from "./_views/CierrePrimarioView";
import InformeInicialView from "./_views/InformeInicialView";

export default function CalificacionesSeccionPage() {
  const { id } = useParams<{ id: string }>();
  const seccionId = Number(id);
  const [loading, setLoading] = useState(true);
  const [seccion, setSeccion] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.secciones.list();
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
  }, [seccionId]);

  const nivel = useMemo(
    () => (seccion?.nivel ?? "").toUpperCase() as "PRIMARIO" | "INICIAL" | "",
    [seccion],
  );

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

        {loading && <div className="text-sm">Cargando…</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}

        {!loading && !error && (
          <>
            {nivel === "PRIMARIO" ? (
              <CierrePrimarioView seccionId={seccionId} />
            ) : (
              <InformeInicialView seccionId={seccionId} />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
