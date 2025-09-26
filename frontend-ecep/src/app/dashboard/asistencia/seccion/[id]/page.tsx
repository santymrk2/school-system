"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar as AttendanceCalendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { asistencias, gestionAcademica } from "@/services/api/modules";
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
  getTrimestreEstado,
  getTrimestreFin,
  getTrimestreInicio,
  TRIMESTRE_ESTADO_LABEL,
} from "@/lib/trimestres";
import { useViewerScope } from "@/hooks/scope/useViewerScope";
import { useScopedSecciones } from "@/hooks/scope/useScopedSecciones";
import { UserRole } from "@/types/api-generated";
import { TrimestreEstadoBadge } from "@/components/trimestres/TrimestreEstadoBadge";

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

function parseISODate(value?: string | null) {
  if (!value) return null;
  const normalized = String(value).slice(0, 10);
  const [yearRaw, monthRaw, dayRaw] = normalized.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }
  return new Date(year, month - 1, day);
}

function formatISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
  const { type, activeRole } = useViewerScope();
  const { loading: scopedLoading, secciones: accesibles } =
    useScopedSecciones();
  const isAdmin = activeRole === UserRole.ADMIN;
  const isTeacher = type === "teacher";
  const isStaff = type === "staff";
  const teacherHasAccess = useMemo(() => {
    if (!isTeacher) return true;
    return accesibles.some((s) => s.id === seccionId);
  }, [accesibles, isTeacher, seccionId]);

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
      trimestresDelPeriodo.find((t) => String(t.id) === selectedTrimestreId) ??
      null
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
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedResumen, setSelectedResumen] =
    useState<AsistenciaDiaDTO | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<Date | undefined>(
    undefined,
  );

  const asistenciaDateSet = useMemo(() => {
    const set = new Set<string>();
    historial.forEach((item) => {
      if (item.fecha) {
        set.add(String(item.fecha).slice(0, 10));
      }
    });
    return set;
  }, [historial]);

  const asistenciaDates = useMemo(() => {
    return Array.from(asistenciaDateSet)
      .map((iso) => parseISODate(iso))
      .filter(
        (date): date is Date =>
          date instanceof Date && !Number.isNaN(date.getTime()),
      )
      .sort((a, b) => a.getTime() - b.getTime());
  }, [asistenciaDateSet]);

  const accessStatus = useMemo(() => {
    if (isAdmin) return "admin" as const;
    if (!isTeacher && !isStaff) return "forbidden" as const;
    if (isTeacher && scopedLoading) return "checking" as const;
    if (isTeacher && !teacherHasAccess) return "notAssigned" as const;
    return "ok" as const;
  }, [isAdmin, isTeacher, isStaff, scopedLoading, teacherHasAccess]);

  useEffect(() => {
    if (accessStatus !== "ok") return;

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
  }, [accessStatus, trimestresDelPeriodo, trimestreActivo]);

  useEffect(() => {
    if (accessStatus !== "ok") return;

    (async () => {
      try {
        setLoadingSec(true);
        const res = await gestionAcademica.secciones.list();
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
  }, [accessStatus, seccionId]);

  const loadAll = useCallback(
    async (rangeFrom: string, rangeTo: string) => {
      try {
        setLoading(true);
        setErr(null);
        const [hRes, rRes] = await Promise.all([
          asistencias.secciones.historialSeccion(seccionId, rangeFrom, rangeTo),
          asistencias.secciones.resumenPorAlumno(seccionId, rangeFrom, rangeTo),
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
    if (accessStatus !== "ok") return;

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
    accessStatus,
  ]);

  useEffect(() => {
    if (!historial.length) {
      setSelectedDay(null);
      setSelectedResumen(null);
      setCalendarMonth(undefined);
      return;
    }

    if (selectedResumen) {
      const refreshed = historial.find(
        (item) => item.id === selectedResumen.id,
      );
      if (refreshed) {
        setSelectedResumen(refreshed);
        if (!selectedDay && refreshed.fecha) {
          const parsed = parseISODate(refreshed.fecha);
          if (parsed) {
            setSelectedDay(parsed);
            setCalendarMonth((prev) => prev ?? parsed);
          }
        }
        return;
      }
    }

    const latest = [...historial]
      .filter((item) => Boolean(item.fecha))
      .sort((a, b) =>
        String(b.fecha ?? "").localeCompare(String(a.fecha ?? "")),
      )[0];

    if (latest && latest.fecha) {
      const parsed = parseISODate(latest.fecha);
      if (parsed) {
        setSelectedDay(parsed);
        setCalendarMonth((prev) => prev ?? parsed);
      }
      setSelectedResumen(latest);
    }
  }, [historial, selectedResumen, selectedDay]);

  const openJornadaDetalle = useCallback(
    async (fechaIso?: string | null) => {
      if (!fechaIso) {
        toast.error("No hay jornada creada para esa fecha.");
        return;
      }

      try {
        const res = await asistencias.jornadas.bySeccionFechaOne(
          seccionId,
          fechaIso,
        );
        const data: any = res.data;
        let jornadaId: number | undefined;
        if (Array.isArray(data)) {
          jornadaId = data.sort((a, b) => (b.id ?? 0) - (a.id ?? 0))[0]?.id;
        } else {
          jornadaId = data?.id;
        }
        if (!jornadaId) {
          toast.error("No hay jornada creada para esa fecha.");
          return;
        }
        router.push(`/dashboard/asistencia/jornada/${jornadaId}`);
      } catch {
        toast.error("No hay jornada creada para esa fecha.");
      }
    },
    [router, seccionId],
  );

  const handleCalendarSelect = useCallback(
    (date: Date | undefined) => {
      if (!date) {
        setSelectedDay(null);
        setSelectedResumen(null);
        return;
      }

      const iso = formatISODate(date);
      if (!asistenciaDateSet.has(iso)) {
        return;
      }

      const match = historial.find(
        (item) => String(item.fecha ?? "").slice(0, 10) === iso,
      );
      if (match) {
        setSelectedDay(date);
        setSelectedResumen(match);
        setCalendarMonth(date);
      }
    },
    [asistenciaDateSet, historial],
  );

  if (accessStatus === "admin") {
    return (
      <div className="p-6 text-sm">
        403 — El perfil de Administración no tiene acceso a Asistencia.
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

  return (
    <div className="p-4 md:p-8 space-y-6">
      <Button
        variant="outline"
        onClick={() => router.push("/dashboard/asistencia")}
      >
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
        {periodError && <p className="text-sm text-red-600">{periodError}</p>}
      </div>

      {loadingPeriod ? (
        <LoadingState label="Cargando trimestres…" />
      ) : !trimestresDelPeriodo.length ? (
        <div className="text-sm text-muted-foreground">
          No hay trimestres configurados para el período actual.
        </div>
      ) : (
        <Tabs
          value={selectedTrimestreId || String(trimestresDelPeriodo[0].id)}
          onValueChange={setSelectedTrimestreId}
          className="space-y-4"
        >
          <TabsList className="flex gap-2 overflow-x-auto md:flex-wrap">
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
              Boolean(getTrimestreInicio(tri)) && Boolean(getTrimestreFin(tri));
            const rangeLabel = formatTrimestreRange(tri);
            const estado = getTrimestreEstado(tri);
            const estadoLabel = TRIMESTRE_ESTADO_LABEL[estado] ?? estado;
            const canEdit = estado === "activo";
            const estadoMessage =
              estado === "cerrado"
                ? "Este trimestre está cerrado. Los registros son solo de lectura."
                : "Este trimestre está inactivo. No podés registrar ni editar asistencia.";
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
                    {err && <div className="text-sm text-red-600">{err}</div>}
                    {!loading && !err && (
                      <>
                        <Card>
                          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                              <CardTitle className="flex flex-wrap items-center gap-2">
                                <span className="flex items-center">
                                  Jornadas del trimestre
                                </span>
                                <TrimestreEstadoBadge
                                  estado={estado}
                                  className="text-xs text-muted-foreground"
                                />
                              </CardTitle>
                            </div>

                            {seccion && (
                              <NewJornadaDialog
                                seccion={seccion}
                                trigger={
                                  <Button
                                    disabled={!canEdit}
                                    title={
                                      canEdit
                                        ? undefined
                                        : "Activá el trimestre para registrar jornadas."
                                    }
                                  >
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

                          <CardContent className="space-y-4">
                            {!canEdit && (
                              <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-400/40 dark:bg-amber-950/40 dark:text-amber-100">
                                <AlertTitle>{estadoLabel}</AlertTitle>
                                <AlertDescription>
                                  {estadoMessage}
                                </AlertDescription>
                              </Alert>
                            )}
                            {historial.length === 0 ? (
                              <div className="text-sm text-muted-foreground">
                                No hay registros en el trimestre seleccionado.
                              </div>
                            ) : (
                              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                                <div className="space-y-4">
                                  <AttendanceCalendar
                                    className="mx-auto w-full max-w-[26rem] rounded-lg border p-3 shadow-sm"
                                    classNames={{
                                      months: "flex flex-col gap-3",
                                      month: "space-y-3",
                                      table: "w-full border-collapse",
                                      head_row:
                                        "grid grid-cols-7 text-[0.7rem] font-medium uppercase tracking-tight text-muted-foreground",
                                      row: "grid grid-cols-7 gap-1",
                                      cell: "flex items-center justify-center p-0",
                                      day: "relative flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors",
                                      day_button:
                                        "flex h-full w-full items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0",
                                      day_selected:
                                        "bg-primary text-primary-foreground hover:bg-primary focus:bg-primary",
                                      day_today:
                                        "border border-primary/60 text-primary aria-selected:bg-primary/15 aria-selected:text-primary",
                                    }}
                                    mode="single"
                                    selected={selectedDay ?? undefined}
                                    onSelect={handleCalendarSelect}
                                    month={calendarMonth}
                                    defaultMonth={
                                      selectedDay ??
                                      asistenciaDates[
                                        asistenciaDates.length - 1
                                      ] ??
                                      new Date()
                                    }
                                    onMonthChange={(month) =>
                                      setCalendarMonth(month)
                                    }
                                    fromDate={
                                      selectedRange?.from
                                        ? (parseISODate(selectedRange.from) ??
                                          undefined)
                                        : undefined
                                    }
                                    toDate={
                                      selectedRange?.to
                                        ? (parseISODate(selectedRange.to) ??
                                          undefined)
                                        : undefined
                                    }
                                    modifiers={{
                                      loaded: asistenciaDates,
                                    }}
                                    modifiersClassNames={{
                                      loaded:
                                        "text-primary ring-2 ring-primary/70 ring-offset-0 ring-offset-transparent aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:ring-0",
                                    }}
                                    disabled={(date) =>
                                      !asistenciaDateSet.has(
                                        formatISODate(date),
                                      )
                                    }
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Seleccioná un día marcado para ver su
                                    resumen y abrir la jornada correspondiente.
                                  </p>
                                </div>
                                <div className="space-y-3">
                                  {selectedResumen ? (
                                    <div className="space-y-4">
                                      <div className="rounded-lg border p-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm font-medium">
                                            Fecha
                                          </span>
                                          <Badge variant="outline">
                                            {fmt(selectedResumen.fecha)}
                                          </Badge>
                                        </div>
                                        <div className="text-sm">
                                          Presentes:{" "}
                                          <b>{selectedResumen.presentes}</b>
                                        </div>
                                        <div className="text-sm">
                                          Ausentes:{" "}
                                          <b>{selectedResumen.ausentes}</b>
                                        </div>
                                        <div className="text-sm">
                                          Llegadas tarde:{" "}
                                          <b>{selectedResumen.tarde}</b>
                                        </div>
                                        <div className="text-sm">
                                          Retiros anticipados:{" "}
                                          <b>
                                            {selectedResumen.retiroAnticipado}
                                          </b>
                                        </div>
                                        <div className="text-sm">
                                          Total registrados:{" "}
                                          <b>{selectedResumen.total}</b>
                                        </div>
                                        <div className="text-sm">
                                          Asistencia promedio:{" "}
                                          <b>
                                            {Math.round(
                                              selectedResumen.porcentaje ?? 0,
                                            )}
                                            %
                                          </b>
                                        </div>
                                      </div>
                                      <Button
                                        onClick={() =>
                                          openJornadaDetalle(
                                            selectedResumen.fecha,
                                          )
                                        }
                                        disabled={!canEdit}
                                        title={
                                          canEdit
                                            ? "Ver/editar jornada"
                                            : "Trimestre no activo. Solo lectura"
                                        }
                                      >
                                        Ver jornada
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="text-sm text-muted-foreground">
                                      Seleccioná un día con registros para ver
                                      su resumen.
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
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
                                      {Math.round(r.porcentaje)}% ({r.presentes}
                                      /{r.presentes + r.ausentes})
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
  );
}
