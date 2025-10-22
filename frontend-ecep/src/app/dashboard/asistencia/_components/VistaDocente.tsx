"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import LoadingState from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Plus, Eye } from "lucide-react";
import { useAsistenciasData } from "@/hooks/useAsistenciasData";
import { useAuth } from "@/hooks/useAuth";
import NuevaAsistenciaDialog from "./NuevaAsistenciaDialog";
import DetalleDiaDialog from "./DetalleDiaDialog";
import type { AsistenciaDiaDTO, SeccionDTO } from "@/types/api-generated";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getTrimestreEstado,
  getTrimestreFin,
  getTrimestreInicio,
  isFechaDentroDeTrimestre,
} from "@/lib/trimestres";
import { logger } from "@/lib/logger";
import { asistencias } from "@/services/api/modules";

const DBG = !!process.env.NEXT_PUBLIC_DEBUG;
const vistaLogger = logger.child({ module: "VistaDocente" });

type SectionSummary = {
  porcentaje: number;
  ultimaFecha: string | null;
  historial: AsistenciaDiaDTO[];
};

const dlog = (...args: any[]) => {
  if (!DBG) return;
  if (!args.length) return;

  const [first, ...rest] = args;

  if (typeof first === "string") {
    if (!rest.length) {
      vistaLogger.debug(first);
      return;
    }

    if (rest.length === 1 && typeof rest[0] === "object") {
      vistaLogger.debug(rest[0] as Record<string, unknown>, first);
      return;
    }

    vistaLogger.debug({ details: rest }, first);
    return;
  }

  vistaLogger.debug({ details: args }, "VistaDocente log");
};

const dgrp = (title: string) => {
  if (!DBG) return;
  vistaLogger.debug({ group: title, phase: "start" }, title);
};

const dgrpEnd = () => {
  if (!DBG) return;
  vistaLogger.debug({ phase: "end" }, "VistaDocente group end");
};

function fmt(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function VistaDocente() {
  const { user } = useAuth();
  const docenteId = user?.personaId ?? 0;

  const {
    loading,
    trimestres,
    secciones,
    asignaciones,
    loadAlumnosSeccion,
  } = useAsistenciasData();

  // ===== DEBUG: primer snapshot al montar / al cambiar dependencias =====
  useEffect(() => {
    dgrp("snapshot inicial");
    dlog("user", user);
    dlog("docenteId (personaId)", docenteId);
    dlog("trimestres", trimestres);
    dlog("secciones", secciones);
    dlog("asignaciones", asignaciones);
    dgrpEnd();
  }, [user, docenteId, trimestres, secciones, asignaciones]);

  const seccionesDocente: SeccionDTO[] = useMemo(() => {
    const setIds = new Set(
      asignaciones
        .filter((a) => a.docenteId === docenteId)
        .map((a) => a.seccionId),
    );
    const res = secciones.filter((s) => setIds.has(s.id));

    dgrp("calculo seccionesDocente");
    dlog("docenteId", docenteId);
    dlog(
      "asignaciones filtradas",
      asignaciones.filter((a) => a.docenteId === docenteId),
    );
    dlog("ids seccion asignadas", Array.from(setIds));
    dlog("seccionesDocente result", res);
    dgrpEnd();

    return res;
  }, [asignaciones, secciones, docenteId]);

  const trimestreHoy = useMemo(() => {
    const nowIso = new Date().toISOString();
    const nowKey = fmt(nowIso);

    const t =
      trimestres.find(
        (tr) =>
          getTrimestreEstado(tr) === "activo" &&
          isFechaDentroDeTrimestre(nowKey, tr),
      ) ?? null;

    dgrp("calculo trimestreHoy");
    dlog("nowKey", nowKey);
    dlog("trimestre elegido", t);
    dgrpEnd();

    return t;
  }, [trimestres]);

  const [openNuevaFor, setOpenNuevaFor] = useState<number | null>(null);
  const [selected, setSelected] = useState<{
    jornadaId: number;
    seccionId: number;
    fecha: string;
  } | null>(null);
  const [sectionSummaries, setSectionSummaries] = useState<
    Record<number, SectionSummary>
  >({});
  const [summariesLoading, setSummariesLoading] = useState(false);
  const [summariesError, setSummariesError] = useState<string | null>(null);
  const [historialStatus, setHistorialStatus] = useState<
    Record<number, { loading: boolean; error: string | null }>
  >({});

  const rangeInfo = useMemo(() => {
    const today = new Date();
    const todayISO = fmt(today.toISOString());
    const fallbackStartDate = new Date(today);
    fallbackStartDate.setDate(fallbackStartDate.getDate() - 30);
    const fallbackStart = fmt(fallbackStartDate.toISOString());

    let from = fallbackStart;
    let to = todayISO;
    let label = "de los últimos 30 días";

    if (trimestreHoy) {
      const inicio = getTrimestreInicio(trimestreHoy) || fallbackStart;
      const fin = getTrimestreFin(trimestreHoy) || todayISO;
      from = inicio || fallbackStart;
      to = fin || todayISO;
      label = "del trimestre activo";
    }

    if (from > to) {
      from = fallbackStart;
      to = todayISO;
    }

    return { from, to, label } as const;
  }, [trimestreHoy]);

  const fetchSectionSummary = useCallback(
    async (seccion: SeccionDTO) => {
      const seccionId = seccion.id;
      const [historialRes, acumuladoRes] = await Promise.all([
        asistencias.secciones.historialSeccion(
          seccionId,
          rangeInfo.from,
          rangeInfo.to,
        ),
        asistencias.secciones.acumuladoSeccion(
          seccionId,
          rangeInfo.from,
          rangeInfo.to,
        ),
      ]);

      const historial = (historialRes.data ?? []).sort((a, b) =>
        (b.fecha ?? "").localeCompare(a.fecha ?? ""),
      );
      const porcentaje = Math.round(acumuladoRes.data?.porcentaje ?? 0);
      const ultimaFecha = historial[0]?.fecha ?? null;

      return {
        seccionId,
        resumen: {
          porcentaje,
          ultimaFecha,
          historial,
        } satisfies SectionSummary,
      };
    },
    [rangeInfo.from, rangeInfo.to],
  );

  useEffect(() => {
    let alive = true;
    if (!seccionesDocente.length) {
      setSectionSummaries({});
      setSummariesError(null);
      setSummariesLoading(false);
      return;
    }

    (async () => {
      try {
        setSummariesLoading(true);
        setSummariesError(null);
        const results = await Promise.allSettled(
          seccionesDocente.map((sec) => fetchSectionSummary(sec)),
        );

        if (!alive) return;

        const next: Record<number, SectionSummary> = {};
        const failed: string[] = [];

        results.forEach((result, index) => {
          const seccion = seccionesDocente[index];
          if (result.status === "fulfilled") {
            next[result.value.seccionId] = result.value.resumen;
          } else {
            const label = `${seccion.gradoSala ?? ""} ${
              seccion.division ?? ""
            }`.trim();
            failed.push(label || `Sección #${seccion.id}`);
          }
        });

        setSectionSummaries(next);
        setSummariesError(
          failed.length
            ? `No se pudo cargar información de ${failed.join(", ")}.`
            : null,
        );
      } catch (error) {
        if (!alive) return;
        const message =
          (error as any)?.response?.data?.message ??
          (error as Error | undefined)?.message ??
          "No se pudo cargar el resumen de asistencia.";
        setSummariesError(message);
      } finally {
        if (alive) setSummariesLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [fetchSectionSummary, seccionesDocente]);

  const refreshSectionSummary = useCallback(
    async (seccionId: number) => {
      const seccion = seccionesDocente.find((s) => s.id === seccionId);
      if (!seccion) return;

      setHistorialStatus((prev) => ({
        ...prev,
        [seccionId]: { loading: true, error: null },
      }));

      try {
        const result = await fetchSectionSummary(seccion);
        setSectionSummaries((prev) => ({
          ...prev,
          [seccionId]: result.resumen,
        }));
        setHistorialStatus((prev) => ({
          ...prev,
          [seccionId]: { loading: false, error: null },
        }));
      } catch (error) {
        vistaLogger.error(
          { error, seccionId },
          "refreshSectionSummary error",
        );
        const message =
          (error as any)?.response?.data?.message ??
          (error as Error | undefined)?.message ??
          "No se pudo cargar el historial.";
        setHistorialStatus((prev) => ({
          ...prev,
          [seccionId]: { loading: false, error: message },
        }));
      }
    },
    [fetchSectionSummary, seccionesDocente],
  );

  const openHistorial = useCallback(
    async (seccionId: number) => {
      dgrp("openHistorial()");
      dlog("params", { seccionId });
      await refreshSectionSummary(seccionId);
      dgrpEnd();
    },
    [refreshSectionSummary],
  );

  if (loading || (summariesLoading && !Object.keys(sectionSummaries).length))
    return <LoadingState label="Cargando información…" />;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {summariesError && (
          <div className="md:col-span-2 lg:col-span-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {summariesError}
          </div>
        )}
        {seccionesDocente.map((sec) => {
          const summary = sectionSummaries[sec.id];
          const promedio = summary?.porcentaje ?? 0;
          const ultimaFecha = summary?.ultimaFecha ?? null;
          const status = historialStatus[sec.id];

          return (
            <Card key={sec.id} className="transition-colors hover:border-primary">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {sec.gradoSala} {sec.division}
                  </CardTitle>
                </div>
                <CardDescription>
                  Promedio {rangeInfo.label}: {summary
                    ? `${promedio}%`
                    : summariesLoading
                      ? "cargando…"
                      : "—"}
                  {" "}— Última jornada: {ultimaFecha ? fmt(ultimaFecha) : "—"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Asistencia Promedio</span>
                    <span>{summary ? `${promedio}%` : "—"}</span>
                  </div>
                  <Progress value={summary ? promedio : 0} className="h-2" />
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={!trimestreHoy}
                    onClick={() => {
                      dlog("click Nueva Asistencia", {
                        seccionId: sec.id,
                        trimestreHoy,
                      });
                      setOpenNuevaFor(sec.id);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Asistencia
                  </Button>

                  <Dialog onOpenChange={(o) => o && openHistorial(sec.id)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Historial
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          Historial — {sec.gradoSala} {sec.division}
                        </DialogTitle>
                        <DialogDescription>
                          Asistencias registradas {rangeInfo.label}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2">
                        {status?.loading ? (
                          <LoadingState label="Cargando historial…" />
                        ) : status?.error ? (
                          <div className="text-sm text-red-600">
                            {status.error}
                          </div>
                        ) : (summary?.historial.length ?? 0) > 0 ? (
                          summary?.historial.map((dia) => (
                            <div
                              key={dia.id}
                              className="flex items-center justify-between border rounded p-2"
                            >
                              <div className="flex items-center gap-3">
                                <Badge variant="outline">{fmt(dia.fecha)}</Badge>
                                <div className="text-sm text-muted-foreground">
                                  {dia.presentes ?? 0}/{dia.total ?? 0} presentes (
                                  {Math.round(dia.porcentaje ?? 0)}%)
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    dgrp("Ver/Editar día");
                                    dlog("jornada", dia);
                                    setSelected({
                                      jornadaId: dia.id,
                                      seccionId: sec.id,
                                      fecha: dia.fecha ?? rangeInfo.to,
                                    });
                                    dgrpEnd();
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" /> Ver / Editar
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            No hay jornadas registradas en el período seleccionado.
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {openNuevaFor === sec.id && (
                  <NuevaAsistenciaDialog
                    open
                    onOpenChange={(v) => setOpenNuevaFor(v ? sec.id : null)}
                    seccion={sec}
                    trimestre={trimestreHoy}
                    alumnos={[]}
                    onCreated={() => {
                      dlog("Nueva asistencia creada → refresco historial", {
                        seccionId: sec.id,
                      });
                      refreshSectionSummary(sec.id);
                    }}
                    // (opcional) ejemplo de carga de alumnos con logging
                    loadAlumnos={async () => {
                      try {
                        const rows = await loadAlumnosSeccion(sec.id);
                        dlog("alumnos de la sección", {
                          seccionId: sec.id,
                          rows,
                        });
                        return rows;
                      } catch (e) {
                        vistaLogger.error(
                          { err: e, seccionId: sec.id },
                          "loadAlumnosSeccion error",
                        );
                        return [];
                      }
                    }}
                  />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selected && (
        <DetalleDiaDialog
          open
          onOpenChange={() => setSelected(null)}
          seccionId={selected.seccionId}
          jornadaId={selected.jornadaId}
          fecha={selected.fecha}
          onUpdated={() => {
            dlog("Detalles actualizados → refresco historial", {
              seccionId: selected.seccionId,
            });
            refreshSectionSummary(selected.seccionId);
          }}
        />
      )}
    </>
  );
}
