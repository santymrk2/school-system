"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/dashboard/dashboard-layout";
import LoadingState from "@/components/common/LoadingState";
import { NewJornadaDialog } from "@/app/dashboard/asistencia/_components/NewJornadaDialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ArrowLeft, Plus } from "lucide-react";
import { api } from "@/services/api";
import type {
  SeccionDTO,
  AsistenciaDiaDTO,
  AsistenciaAlumnoResumenDTO,
} from "@/types/api-generated";
import { toast } from "sonner";
import { ActiveTrimestreBadge } from "@/app/dashboard/_components/ActiveTrimestreBadge";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod";
import {
  formatTrimestreRange,
  getTrimestreFin,
  getTrimestreInicio,
} from "@/lib/trimestres";

function fmt(iso?: string) {
  if (!iso) return "—";
  const normalized = String(iso).slice(0, 10);
  const parts = normalized.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    const dd = day.padStart(2, "0");
    const mm = month.padStart(2, "0");
    return `${dd}/${mm}/${year}`;
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
}
function alumnoDisplayName(row: any) {
  return (
    row?.nombreCompleto ??
    (row?.apellido && row?.nombre ? `${row.apellido}, ${row.nombre}` : null) ??
    row?.alumnoNombre ??
    row?.nombre ??
    `Alumno #${row?.matriculaId ?? row?.alumnoId ?? "?"}`
  );
}

export default function SeccionHistorialPage() {
  const { id } = useParams<{ id: string }>();
  const seccionId = Number(id);
  const router = useRouter();

  const [seccion, setSeccion] = useState<SeccionDTO | null>(null);
  const [loadingSec, setLoadingSec] = useState<boolean>(true);
  const [secErr, setSecErr] = useState<string | null>(null);

  const {
    trimestresDelPeriodo,
    trimestreActivo,
    loading: loadingPeriod,
    error: periodError,
  } = useActivePeriod();

  const [selectedTrimestreId, setSelectedTrimestreId] = useState<string>("");

  const selectedTrimestre = useMemo(() => {
    if (!selectedTrimestreId) return null;
    return (
      trimestresDelPeriodo.find(
        (t) => String(t.id) === selectedTrimestreId,
      ) ?? null
    );
  }, [selectedTrimestreId, trimestresDelPeriodo]);

  const selectedRange = useMemo(() => {
    if (!selectedTrimestre) return null;
    const inicio = getTrimestreInicio(selectedTrimestre);
    const fin = getTrimestreFin(selectedTrimestre);
    if (!inicio || !fin) return null;
    if (inicio <= fin) {
      return { from: inicio, to: fin } as const;
    }
    return { from: fin, to: inicio } as const;
  }, [selectedTrimestre]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [historial, setHistorial] = useState<AsistenciaDiaDTO[]>([]);
  const [resumen, setResumen] = useState<AsistenciaAlumnoResumenDTO[]>([]);

  useEffect(() => {
    if (!trimestresDelPeriodo.length) {
      setSelectedTrimestreId("");
      return;
    }

    setSelectedTrimestreId((prev) => {
      if (prev && trimestresDelPeriodo.some((t) => String(t.id) === prev)) {
        return prev;
      }
      const active =
        trimestreActivo &&
        trimestresDelPeriodo.some((t) => t.id === trimestreActivo.id)
          ? String(trimestreActivo.id)
          : String(trimestresDelPeriodo[0].id);
      return active;
    });
  }, [trimestresDelPeriodo, trimestreActivo]);

  useEffect(() => {
    (async () => {
      try {
        setLoadingSec(true);
        const res = await api.secciones.list();
        const s =
          (res.data ?? []).find((x: SeccionDTO) => x.id === seccionId) ?? null;
        setSeccion(s);
      } catch (e: any) {
        setSecErr(
          e?.response?.data?.message ??
            e?.message ??
            "No pude obtener la sección.",
        );
      } finally {
        setLoadingSec(false);
      }
    })();
  }, [seccionId]);

  const loadAll = useCallback(
    async (rangeFrom: string, rangeTo: string) => {
      try {
        setLoading(true);
        setErr(null);
        const [hRes, rRes] = await Promise.all([
          api.asistencias.historialSeccion(seccionId, rangeFrom, rangeTo),
          api.asistencias.resumenPorAlumno(seccionId, rangeFrom, rangeTo),
        ]);
        setHistorial(hRes.data ?? []);
        setResumen(rRes.data ?? []);
      } catch (e: any) {
        const msg =
          e?.response?.status === 400
            ? "Rango de fechas inválido o faltante para el trimestre seleccionado."
            : e?.response?.status === 403
              ? "No tenés permisos para ver esta información (403)."
              : (e?.response?.data?.message ??
                e?.message ??
                "Error al cargar datos.");
        setErr(msg);
      } finally {
        setLoading(false);
      }
    },
    [seccionId],
  );

  useEffect(() => {
    if (!Number.isFinite(seccionId)) return;
    if (!selectedTrimestreId) {
      setLoading(false);
      return;
    }
    if (!selectedRange) {
      setHistorial([]);
      setResumen([]);
      setErr(null);
      setLoading(false);
      return;
    }
    loadAll(selectedRange.from, selectedRange.to);
  }, [
    seccionId,
    selectedTrimestreId,
    selectedRange?.from,
    selectedRange?.to,
    loadAll,
  ]);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/asistencia")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>

        <div className="space-y-3">
          <div>
            <h2 className="text-2xl font-bold">
              Historial — Sección{" "}
              {seccion
                ? `${seccion.gradoSala} ${seccion.division}`
                : loadingSec
                  ? "cargando…"
                  : `#${seccionId}`}
            </h2>
            <p className="text-sm text-muted-foreground">
              Turno: {seccion?.turno ?? "—"}
            </p>
            {secErr && <p className="text-sm text-red-600">{secErr}</p>}
            <ActiveTrimestreBadge className="mt-2" />
          </div>
          {periodError && (
            <p className="text-sm text-red-600">{periodError}</p>
          )}
        </div>

        {loadingPeriod ? (
          <LoadingState label="Cargando trimestres…" />
        ) : !trimestresDelPeriodo.length ? (
          <div className="text-sm text-muted-foreground">
            No hay trimestres configurados para el período actual.
          </div>
        ) : (
          <Tabs
            value={
              selectedTrimestreId || String(trimestresDelPeriodo[0].id)
            }
            onValueChange={setSelectedTrimestreId}
            className="space-y-4"
          >
            <TabsList className="flex flex-wrap gap-2">
              {trimestresDelPeriodo.map((tri, index) => {
                const label =
                  tri.orden != null
                    ? `Trimestre ${tri.orden}`
                    : `Trimestre ${index + 1}`;
                return (
                  <TabsTrigger key={tri.id} value={String(tri.id)}>
                    {label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {trimestresDelPeriodo.map((tri) => {
              const value = String(tri.id);
              const hasRange =
                Boolean(getTrimestreInicio(tri)) &&
                Boolean(getTrimestreFin(tri));
              const rangeLabel = formatTrimestreRange(tri);
              return (
                <TabsContent key={value} value={value} className="space-y-4">
                  {!hasRange ? (
                    <div className="text-sm text-muted-foreground">
                      Configurá las fechas de inicio y fin del trimestre para
                      visualizar los registros de asistencia.
                    </div>
                  ) : (
                    <>
                      {loading && <LoadingState label="Cargando asistencia…" />}
                      {err && (
                        <div className="text-sm text-red-600">{err}</div>
                      )}
                      {!loading && !err && (
                        <>
                          <Card>
                            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                              <div>
                                <CardTitle className="flex items-center">
                                  <Calendar className="h-5 w-5 mr-2" />
                                  Jornadas del trimestre
                                </CardTitle>
                                <CardDescription>
                                  Seleccioná una fecha para ver o editar la
                                  jornada.
                                  {rangeLabel && (
                                    <span className="block text-xs text-muted-foreground">
                                      {rangeLabel}
                                    </span>
                                  )}
                                </CardDescription>
                              </div>

                              {seccion && (
                                <NewJornadaDialog
                                  seccion={seccion}
                                  trigger={
                                    <Button>
                                      <Plus className="h-4 w-4 mr-2" />
                                      Nueva jornada
                                    </Button>
                                  }
                                  onCreated={(jid) =>
                                    router.push(
                                      `/dashboard/asistencia/jornada/${jid}`,
                                    )
                                  }
                                />
                              )}
                            </CardHeader>

                            <CardContent className="space-y-2">
                              {historial.length === 0 && (
                                <div className="text-sm text-muted-foreground">
                                  No hay registros en el trimestre seleccionado.
                                </div>
                              )}

                              {historial.map((d) => (
                                <button
                                  key={d.fecha}
                                  className="w-full text-left"
                                  onClick={async () => {
                                    try {
                                      const res =
                                        await api.jornadasAsistencia.bySeccionFechaOne(
                                          seccionId,
                                          d.fecha,
                                        );
                                      const data: any = res.data;
                                      let jId: number | undefined;
                                      if (Array.isArray(data)) {
                                        jId = data.sort(
                                          (a, b) => (b.id ?? 0) - (a.id ?? 0),
                                        )[0]?.id;
                                      } else {
                                        jId = data?.id;
                                      }
                                      if (!jId) {
                                        toast.error(
                                          "No hay jornada creada para esa fecha.",
                                        );
                                        return;
                                      }
                                      router.push(
                                        `/dashboard/asistencia/jornada/${jId}`,
                                      );
                                    } catch {
                                      toast.error(
                                        "No hay jornada creada para esa fecha.",
                                      );
                                    }
                                  }}
                                  title="Ver/editar detalle"
                                >
                                  <div className="flex items-center justify-between border rounded p-2 hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                      <Badge variant="outline">{fmt(d.fecha)}</Badge>
                                      <span className="text-sm">
                                        Presentes: <b>{d.presentes}</b> — Ausentes:{" "}
                                        <b>{d.ausentes}</b> — %:{" "}
                                        <b>{Math.round(d.porcentaje)}%</b>
                                      </span>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle>Asistencia por alumno</CardTitle>
                              <CardDescription>
                                Porcentaje acumulado en el trimestre
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {resumen.length === 0 ? (
                                <div className="text-sm text-muted-foreground">
                                  Sin registros acumulados para este trimestre.
                                </div>
                              ) : (
                                resumen.map((r) => (
                                  <div key={r.matriculaId} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span className="font-medium">
                                        {alumnoDisplayName(r as any)}
                                      </span>
                                      <span>
                                        {Math.round(r.porcentaje)}% ({r.presentes}/
                                        {r.presentes + r.ausentes})
                                      </span>
                                    </div>
                                    <Progress
                                      value={Math.round(r.porcentaje)}
                                      className="h-2"
                                    />
                                  </div>
                                ))
                              )}
                            </CardContent>
                          </Card>
                        </>
                      )}
                    </>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
