"use client";

import { useEffect, useMemo, useState } from "react";
import LoadingState from "@/components/common/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar as AttendanceCalendar } from "@/components/ui/calendar";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod";
import { useViewerAlumnosLite } from "@/hooks/useViewerAlumnosLite";
import { cn } from "@/lib/utils";
import { asistencias } from "@/services/api/modules";
import type {
  AlumnoLiteDTO,
  DetalleAsistenciaDTO,
  JornadaAsistenciaDTO,
  NivelAcademico,
} from "@/types/api-generated";
import { NivelAcademico as NivelAcademicoEnum, UserRole } from "@/types/api-generated";
import { CheckCircle, Minus, X } from "lucide-react";

type AttendanceCategory =
  | "present"
  | "absent"
  | "late"
  | "justified"
  | "other";

const attendancePriority: Record<AttendanceCategory, number> = {
  other: 0,
  present: 1,
  justified: 2,
  late: 3,
  absent: 4,
};

const calendarModifierClassNames: Record<AttendanceCategory, string> = {
  present:
    "bg-emerald-500 text-white hover:bg-emerald-500 hover:text-white focus:bg-emerald-500 focus:text-white",
  absent:
    "bg-red-500 text-white hover:bg-red-500 hover:text-white focus:bg-red-500 focus:text-white",
  late:
    "bg-amber-500 text-white hover:bg-amber-500 hover:text-white focus:bg-amber-500 focus:text-white",
  justified:
    "bg-sky-500 text-white hover:bg-sky-500 hover:text-white focus:bg-sky-500 focus:text-white",
  other:
    "bg-slate-300 text-slate-900 hover:bg-slate-300 hover:text-slate-900 focus:bg-slate-300 focus:text-slate-900",
};

const calendarLegend: { key: AttendanceCategory; label: string; dotClass: string }[] = [
  { key: "present", label: "Presente", dotClass: "bg-emerald-500" },
  { key: "absent", label: "Ausente", dotClass: "bg-red-500" },
  { key: "late", label: "Llegó tarde", dotClass: "bg-amber-500" },
  { key: "justified", label: "Ausencia justificada", dotClass: "bg-sky-500" },
  { key: "other", label: "Otro registro", dotClass: "bg-slate-300" },
];

function Donut({ percent }: { percent: number }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const normalized = Math.max(0, Math.min(100, percent));
  const off = c - (normalized / 100) * c;
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="transparent"
        stroke="#e5e7eb"
        strokeWidth="10"
      />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="transparent"
        stroke="currentColor"
        strokeWidth="10"
        strokeDasharray={c}
        strokeDashoffset={off}
        transform="rotate(-90 50 50)"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="16"
      >
        {normalized}%
      </text>
    </svg>
  );
}

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatDate(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "—";
  return dateFormatter.format(parsed);
}

function parseISODateToDate(value?: string | null) {
  if (!value) return null;
  const parts = value.split("-");
  if (parts.length !== 3) return null;
  const [yearRaw, monthRaw, dayRaw] = parts;
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

function toAttendanceCategory(estado?: string | null): AttendanceCategory {
  const normalized = String(estado ?? "").toUpperCase();
  if (normalized === "PRESENTE") return "present";
  if (normalized === "AUSENTE") return "absent";
  if (normalized === "TARDE") return "late";
  if (normalized === "JUSTIFICADA") return "justified";
  return "other";
}

function nivelLabel(nivel?: NivelAcademico | null) {
  if (!nivel) return "Nivel no disponible";
  if (nivel === NivelAcademicoEnum.PRIMARIO) return "Nivel primario";
  if (nivel === NivelAcademicoEnum.INICIAL) return "Nivel inicial";
  return String(nivel);
}

function estadoLabel(estado?: string | null) {
  if (!estado) return "Sin dato";
  const normalized = estado.toLowerCase();
  if (normalized === "presente") return "Presente";
  if (normalized === "ausente") return "Ausente";
  if (normalized === "tarde") return "Llegó tarde";
  if (normalized === "justificada") return "Ausencia justificada";
  return estado
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim();
}

function estadoVariant(estado?: string | null) {
  if (!estado) return "outline" as const;
  const normalized = estado.toLowerCase();
  if (normalized === "presente") return "default" as const;
  if (normalized === "ausente") return "destructive" as const;
  return "secondary" as const;
}

export function FamilyAttendanceView() {
  const { role, alumnos, loading, error } = useViewerAlumnosLite();
  const { trimestresDelPeriodo, loading: periodoLoading, hoyISO } =
    useActivePeriod();
  const [selectedMatriculaId, setSelectedMatriculaId] = useState<number | null>(
    null,
  );
  const [detalles, setDetalles] = useState<DetalleAsistenciaDTO[]>([]);
  const [jornadas, setJornadas] = useState<Map<number, JornadaAsistenciaDTO>>(
    new Map(),
  );
  const [loadingDetalles, setLoadingDetalles] = useState(false);
  const [errorDetalles, setErrorDetalles] = useState<string | null>(null);

  useEffect(() => {
    if (!alumnos.length) {
      setSelectedMatriculaId(null);
      setDetalles([]);
      setJornadas(new Map());
      return;
    }

    if (
      selectedMatriculaId == null ||
      !alumnos.some((a) => a.matriculaId === selectedMatriculaId)
    ) {
      setSelectedMatriculaId(alumnos[0].matriculaId);
    }
  }, [alumnos, selectedMatriculaId]);

  const alumnoSeleccionado: AlumnoLiteDTO | null = useMemo(() => {
    if (selectedMatriculaId == null) return null;
    return (
      alumnos.find((al) => al.matriculaId === selectedMatriculaId) ?? null
    );
  }, [alumnos, selectedMatriculaId]);

  const periodoDateRange = useMemo(() => {
    if (!trimestresDelPeriodo?.length) {
      return {
        fromISO: null as string | null,
        toISO: null as string | null,
        fromDate: null as Date | null,
        toDate: null as Date | null,
      };
    }

    let fromISO: string | null = null;
    let toISO: string | null = null;

    for (const tri of trimestresDelPeriodo) {
      const start =
        ((tri as any).fechaInicio ?? (tri as any).inicio ?? null) as
          | string
          | null;
      const end =
        ((tri as any).fechaFin ?? (tri as any).fin ?? null) as string | null;

      if (start && (!fromISO || start < fromISO)) {
        fromISO = start;
      }
      if (end && (!toISO || end > toISO)) {
        toISO = end;
      }
    }

    return {
      fromISO,
      toISO,
      fromDate: parseISODateToDate(fromISO),
      toDate: parseISODateToDate(toISO),
    };
  }, [trimestresDelPeriodo]);

  useEffect(() => {
    let alive = true;

    async function fetchDetalles() {
      if (!alumnoSeleccionado) {
        setDetalles([]);
        setJornadas(new Map());
        setErrorDetalles(null);
        setLoadingDetalles(false);
        return;
      }

      if (periodoLoading) {
        setLoadingDetalles(true);
        return;
      }

      if (!periodoDateRange.fromISO || !periodoDateRange.toISO) {
        setDetalles([]);
        setJornadas(new Map());
        setErrorDetalles(null);
        setLoadingDetalles(false);
        return;
      }

      try {
        setLoadingDetalles(true);
        setErrorDetalles(null);

        const { data } = await asistencias.detalles.search({
          matriculaId: alumnoSeleccionado.matriculaId,
          desde: periodoDateRange.fromISO,
          hasta: periodoDateRange.toISO,
        });
        if (!alive) return;
        const registros = data ?? [];
        setDetalles(registros);

        const jornadaIds = Array.from(
          new Set(
            registros
              .map((d) => d.jornadaId)
              .filter((id): id is number => typeof id === "number"),
          ),
        );

        if (!jornadaIds.length) {
          setJornadas(new Map());
          return;
        }

        const entries = await Promise.all(
          jornadaIds.map(async (jid) => {
            try {
              const res = await asistencias.jornadas.byId(jid);
              return [jid, res.data ?? null] as const;
            } catch {
              return [jid, null] as const;
            }
          }),
        );
        if (!alive) return;
        const next = new Map<number, JornadaAsistenciaDTO>();
        for (const [jid, jornada] of entries) {
          if (jornada) next.set(jid, jornada);
        }
        setJornadas(next);
      } catch (fetchError: any) {
        if (!alive) return;
        setErrorDetalles(
          fetchError?.response?.data?.message ??
            fetchError?.message ??
            "No se pudo obtener el historial de asistencias.",
        );
        setDetalles([]);
        setJornadas(new Map());
      } finally {
        if (alive) setLoadingDetalles(false);
      }
    }

    fetchDetalles();

    return () => {
      alive = false;
    };
  }, [
    alumnoSeleccionado,
    periodoDateRange.fromISO,
    periodoDateRange.toISO,
    periodoLoading,
  ]);

  const resumen = useMemo(() => {
    if (!detalles.length) {
      return {
        total: 0,
        presentes: 0,
        ausentes: 0,
        otros: 0,
        porcentaje: 0,
      };
    }

    const presentes = detalles.filter(
      (d) => String(d.estado).toUpperCase() === "PRESENTE",
    ).length;
    const ausentes = detalles.filter(
      (d) => String(d.estado).toUpperCase() === "AUSENTE",
    ).length;
    const otros = detalles.length - presentes - ausentes;
    const porcentaje = Math.round((presentes / detalles.length) * 100);

    return { total: detalles.length, presentes, ausentes, otros, porcentaje };
  }, [detalles]);

  const historial = useMemo(() => {
    const fromISO = periodoDateRange.fromISO;
    const toISO = periodoDateRange.toISO;

    return detalles
      .map((detalle) => {
        const jornada = detalle.jornadaId
          ? jornadas.get(detalle.jornadaId)
          : null;
        const fecha = jornada?.fecha ?? null;
        const isoFecha = fecha ?? null;
        const inRange =
          !isoFecha ||
          !fromISO ||
          !toISO ||
          (isoFecha >= fromISO && isoFecha <= toISO);

        return {
          id: detalle.id,
          estado: detalle.estado,
          observacion: detalle.observacion,
          fecha: inRange ? fecha : null,
          fechaISO: fecha,
        };
      })
      .filter((item) => item.fechaISO == null || item.fecha != null)
      .sort((a, b) => (b.fecha ?? "").localeCompare(a.fecha ?? ""));
  }, [detalles, jornadas, periodoDateRange.fromISO, periodoDateRange.toISO]);

  const calendarData = useMemo(() => {
    const dayByISO = new Map<
      string,
      { key: AttendanceCategory; date: Date }
    >();

    for (const item of historial) {
      if (!item.fechaISO) continue;
      const date = parseISODateToDate(item.fechaISO);
      if (!date) continue;
      const key = toAttendanceCategory(item.estado);
      const existing = dayByISO.get(item.fechaISO);
      if (!existing || attendancePriority[key] > attendancePriority[existing.key]) {
        dayByISO.set(item.fechaISO, { key, date });
      }
    }

    const modifiers: Record<AttendanceCategory, Date[]> = {
      present: [],
      absent: [],
      late: [],
      justified: [],
      other: [],
    };

    for (const [, value] of dayByISO) {
      modifiers[value.key].push(value.date);
    }

    return {
      modifiers,
      hasData: dayByISO.size > 0,
    };
  }, [historial]);

  const calendarDefaultMonth = useMemo(() => {
    const withFecha = historial.find((item) => item.fechaISO);
    if (withFecha?.fechaISO) {
      const parsed = parseISODateToDate(withFecha.fechaISO);
      if (parsed) return parsed;
    }
    if (periodoDateRange.fromDate) return periodoDateRange.fromDate;
    if (hoyISO) {
      const parsedHoy = parseISODateToDate(hoyISO);
      if (parsedHoy) return parsedHoy;
    }
    return new Date();
  }, [historial, periodoDateRange.fromDate, hoyISO]);

  if (loading) {
    return <LoadingState label="Cargando alumnos vinculados…" />;
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  if (!alumnos.length) {
    return (
      <div className="text-sm text-muted-foreground">
        No hay alumnos asociados a tu cuenta en este momento.
      </div>
    );
  }

  const titulo =
    role === UserRole.STUDENT ? "Mi asistencia" : "Asistencia por alumno";

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h3 className="text-2xl font-semibold tracking-tight">{titulo}</h3>
        <p className="text-sm text-muted-foreground">
          Seleccioná un alumno para revisar su historial diario y el porcentaje
          total de asistencias.
        </p>
      </header>

      {alumnos.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {alumnos.map((al) => (
            <Button
              key={al.matriculaId}
              size="sm"
              variant={
                selectedMatriculaId === al.matriculaId ? "default" : "outline"
              }
              onClick={() => setSelectedMatriculaId(al.matriculaId)}
            >
              {al.nombreCompleto}
            </Button>
          ))}
        </div>
      )}

      {alumnoSeleccionado && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{alumnoSeleccionado.nombreCompleto}</CardTitle>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {alumnoSeleccionado.seccionNombre && (
                    <div>Sección: {alumnoSeleccionado.seccionNombre}</div>
                  )}
                  <div>{nivelLabel(alumnoSeleccionado.nivel)}</div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingDetalles ? (
                  <LoadingState label="Cargando asistencias…" className="h-32" />
                ) : (
                  <div className="flex flex-col gap-6 md:flex-row md:items-center">
                    <div className="text-primary">
                      <Donut percent={resumen.porcentaje} />
                    </div>
                    <div className="flex-1 space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium">
                          Presentes: {resumen.presentes}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <X className="h-4 w-4 text-red-600" />
                        <span className="font-medium">
                          Ausentes: {resumen.ausentes}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Minus className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          Otros registros: {resumen.otros}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total de días registrados: {resumen.total}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Historial diario</CardTitle>
                <CardDescription>
                  Registros de asistencias e inasistencias cargados por los
                  docentes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingDetalles && (
                  <LoadingState label="Cargando historial…" className="h-32" />
                )}

                {!loadingDetalles && errorDetalles && (
                  <div className="text-sm text-red-600">{errorDetalles}</div>
                )}

                {!loadingDetalles && !errorDetalles && !historial.length && (
                  <div className="text-sm text-muted-foreground">
                    Aún no hay asistencias registradas en el período consultado.
                  </div>
                )}

                {!loadingDetalles && !errorDetalles && historial.length > 0 && (
                  <div className="space-y-2">
                    {historial.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded border p-3"
                      >
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {formatDate(item.fecha)}
                          </div>
                          {item.observacion && (
                            <p className="text-xs text-muted-foreground">
                              {item.observacion}
                            </p>
                          )}
                        </div>
                        <Badge variant={estadoVariant(item.estado)}>
                          {estadoLabel(item.estado)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="h-full">
            <CardHeader>
              <CardTitle>Calendario de asistencias</CardTitle>
              <CardDescription>
                Visualizá rápidamente los días presentes, ausentes o con
                novedades del período activo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingDetalles ? (
                <LoadingState label="Cargando calendario…" className="h-64" />
              ) : (
                <div className="space-y-4">
                  <AttendanceCalendar
                    className="mx-auto w-full max-w-[30rem] rounded-lg border p-4"
                    classNames={{
                      months: "flex flex-col gap-4",
                      day: cn(
                        "h-10 w-10 p-0 text-sm font-medium",
                        "aria-selected:opacity-100",
                      ),
                      day_today:
                        "border border-primary text-primary aria-selected:bg-primary/90 aria-selected:text-primary-foreground",
                    }}
                    disableMonthDropdown
                    disableYearDropdown
                    defaultMonth={calendarDefaultMonth}
                    fromDate={periodoDateRange.fromDate ?? undefined}
                    toDate={periodoDateRange.toDate ?? undefined}
                    modifiers={calendarData.modifiers}
                    modifiersClassNames={calendarModifierClassNames}
                  />

                  <div className="flex flex-wrap gap-4 text-xs">
                    {calendarLegend.map((item) => {
                      const active = calendarData.modifiers[item.key].length > 0;
                      return (
                        <div
                          key={item.key}
                          className="flex items-center gap-2"
                        >
                          <span
                            aria-hidden
                            className={cn(
                              "h-3 w-3 rounded-full",
                              item.dotClass,
                              !active && "opacity-30",
                            )}
                          />
                          <span className="font-medium">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {!calendarData.hasData && (
                    <p className="text-sm text-muted-foreground">
                      Aún no hay asistencias registradas en el calendario del
                      período activo.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default FamilyAttendanceView;
