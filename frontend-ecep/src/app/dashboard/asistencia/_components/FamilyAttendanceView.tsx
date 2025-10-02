"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LoadingState from "@/components/common/LoadingState";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar as AttendanceCalendar } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { CircleCheck, X } from "lucide-react";
import type { DayContentProps } from "react-day-picker";

type AttendanceCategory = "present" | "absent";

const attendancePriority: Record<AttendanceCategory, number> = {
  present: 1,
  absent: 2,
};

const calendarModifierClassNames: Record<AttendanceCategory, string> = {
  present:
    "bg-secondary/20 text-secondary hover:bg-secondary/25 focus:bg-secondary/25 dark:text-secondary-foreground dark:hover:bg-secondary/30 dark:focus:bg-secondary/30",
  absent:
    "bg-red-500/15 text-red-700 hover:bg-red-500/20 focus:bg-red-500/20",
};

const calendarLegend: { key: AttendanceCategory; label: string; dotClass: string }[] = [
  { key: "present", label: "Presente", dotClass: "bg-secondary" },
  { key: "absent", label: "Ausente", dotClass: "bg-red-500/70" },
];

const calendarDayBadge: Record<AttendanceCategory, { text: string; className: string }> = {
  present: { text: "Presente", className: "bg-secondary text-secondary-foreground" },
  absent: { text: "Ausente", className: "bg-red-100 text-red-700" },
};

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
  if (normalized.includes("PRESENT")) return "present";
  return "absent";
}

function nivelLabel(nivel?: NivelAcademico | null) {
  if (!nivel) return "Nivel no disponible";
  if (nivel === NivelAcademicoEnum.PRIMARIO) return "Nivel primario";
  if (nivel === NivelAcademicoEnum.INICIAL) return "Nivel inicial";
  return String(nivel);
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
  const selectedAlumnoMatriculaId = alumnoSeleccionado?.matriculaId ?? null;

  useEffect(() => {
    setDetalles([]);
    setJornadas(new Map());
    setErrorDetalles(null);
    setLoadingDetalles(alumnoSeleccionado != null);
  }, [alumnoSeleccionado?.matriculaId]);

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

        const next = new Map<number, JornadaAsistenciaDTO>();

        const seccionId = alumnoSeleccionado?.seccionId ?? null;
        let fetchedJornadas: JornadaAsistenciaDTO[] = [];

        if (
          seccionId != null &&
          periodoDateRange.fromISO &&
          periodoDateRange.toISO
        ) {
          try {
            const { data: jornadasData } = await asistencias.jornadas.search({
              seccionId,
              from: periodoDateRange.fromISO,
              to: periodoDateRange.toISO,
            });
            fetchedJornadas = (jornadasData ?? []).filter(
              (j): j is JornadaAsistenciaDTO =>
                !!j && typeof j.id === "number" && jornadaIds.includes(j.id),
            );
          } catch {
            // ignoramos el error y usamos el fallback debajo
            fetchedJornadas = [];
          }
        }

        if (!fetchedJornadas.length) {
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
          for (const [jid, jornada] of entries) {
            if (jornada) next.set(jid, jornada);
          }
        } else {
          if (!alive) return;
          for (const jornada of fetchedJornadas) {
            next.set(jornada.id, jornada);
          }
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

  const detallesDelAlumno = useMemo(() => {
    if (selectedAlumnoMatriculaId == null) {
      return [] as DetalleAsistenciaDTO[];
    }

    return detalles.filter((detalle) => {
      if (detalle.matriculaId == null) return true;
      return detalle.matriculaId === selectedAlumnoMatriculaId;
    });
  }, [detalles, selectedAlumnoMatriculaId]);

  const detallesEnPeriodo = useMemo(() => {
    const fromISO = periodoDateRange.fromISO;
    const toISO = periodoDateRange.toISO;

    if (!fromISO || !toISO) {
      return [] as DetalleAsistenciaDTO[];
    }

    const bestByJornada = new Map<number, DetalleAsistenciaDTO>();
    const sinJornada: DetalleAsistenciaDTO[] = [];

    for (const detalle of detallesDelAlumno) {
      const jornada = detalle.jornadaId
        ? jornadas.get(detalle.jornadaId)
        : null;
      const fecha = jornada?.fecha ?? null;
      if (!fecha || fecha < fromISO || fecha > toISO) {
        continue;
      }

      if (detalle.jornadaId == null) {
        sinJornada.push(detalle);
        continue;
      }

      const existing = bestByJornada.get(detalle.jornadaId);
      if (!existing) {
        bestByJornada.set(detalle.jornadaId, detalle);
        continue;
      }

      const nextPriority = attendancePriority[toAttendanceCategory(detalle.estado)];
      const currentPriority =
        attendancePriority[toAttendanceCategory(existing.estado)];

      if (nextPriority >= currentPriority) {
        bestByJornada.set(detalle.jornadaId, detalle);
      }
    }

    const getFecha = (detalle: DetalleAsistenciaDTO) => {
      const jornada = detalle.jornadaId
        ? jornadas.get(detalle.jornadaId)
        : null;
      return jornada?.fecha ?? "";
    };

    return [...bestByJornada.values(), ...sinJornada].sort((a, b) =>
      getFecha(b).localeCompare(getFecha(a)),
    );
  }, [
    detallesDelAlumno,
    jornadas,
    periodoDateRange.fromISO,
    periodoDateRange.toISO,
  ]);

  const resumen = useMemo(() => {
    if (!detallesEnPeriodo.length) {
      return {
        total: 0,
        presentes: 0,
        ausentes: 0,
        porcentaje: 0,
      };
    }

    const presentes = detallesEnPeriodo.filter(
      (d) => toAttendanceCategory(d.estado) === "present",
    ).length;
    const ausentes = detallesEnPeriodo.length - presentes;
    const porcentaje = Math.round((presentes / detallesEnPeriodo.length) * 100);

    return {
      total: detallesEnPeriodo.length,
      presentes,
      ausentes,
      porcentaje,
    };
  }, [detallesEnPeriodo]);

  const historial = useMemo(() => {
    return detallesEnPeriodo
      .map((detalle) => {
        const jornada = detalle.jornadaId
          ? jornadas.get(detalle.jornadaId)
          : null;
        const fecha = jornada?.fecha ?? null;

        return {
          id: detalle.id,
          estado: detalle.estado,
          observacion: detalle.observacion,
          fecha,
          fechaISO: fecha,
        };
      })
      .filter((item) => item.fechaISO != null)
      .sort((a, b) => (b.fecha ?? "").localeCompare(a.fecha ?? ""));
  }, [detallesEnPeriodo, jornadas]);

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
    };

    const labelByTime = new Map<number, AttendanceCategory>();

    for (const [, value] of dayByISO) {
      const keyTime = new Date(
        value.date.getFullYear(),
        value.date.getMonth(),
        value.date.getDate(),
      ).getTime();
      labelByTime.set(keyTime, value.key);
      modifiers[value.key].push(value.date);
    }

    return {
      modifiers,
      hasData: dayByISO.size > 0,
      labelByTime,
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

  const calendarMinDate = periodoDateRange.fromDate ?? undefined;
  const calendarMaxDate = periodoDateRange.toDate ?? undefined;

  const clampCalendarMonth = useMemo(() => {
    const minMonthTime = calendarMinDate
      ? new Date(
          calendarMinDate.getFullYear(),
          calendarMinDate.getMonth(),
          1,
        ).getTime()
      : null;
    const maxMonthTime = calendarMaxDate
      ? new Date(
          calendarMaxDate.getFullYear(),
          calendarMaxDate.getMonth(),
          1,
        ).getTime()
      : null;

    return (value: Date | undefined) => {
      if (!value) return value;
      const normalized = new Date(value.getFullYear(), value.getMonth(), 1);
      const time = normalized.getTime();
      if (minMonthTime != null && time < minMonthTime) {
        return new Date(minMonthTime);
      }
      if (maxMonthTime != null && time > maxMonthTime) {
        return new Date(maxMonthTime);
      }
      return normalized;
    };
  }, [calendarMinDate, calendarMaxDate]);

  const [calendarMonth, setCalendarMonth] = useState<Date | undefined>(undefined);

  useEffect(() => {
    setCalendarMonth((prev) => {
      if (!calendarDefaultMonth) return clampCalendarMonth(prev);
      if (!prev) return clampCalendarMonth(calendarDefaultMonth);
      const sameMonth =
        prev.getFullYear() === calendarDefaultMonth.getFullYear() &&
        prev.getMonth() === calendarDefaultMonth.getMonth();
      return clampCalendarMonth(sameMonth ? prev : calendarDefaultMonth);
    });
  }, [calendarDefaultMonth, clampCalendarMonth]);

  useEffect(() => {
    setCalendarMonth((prev) => clampCalendarMonth(prev));
  }, [clampCalendarMonth]);

  const handleCalendarMonthChange = useCallback(
    (nextMonth: Date) => {
      setCalendarMonth(clampCalendarMonth(nextMonth));
    },
    [clampCalendarMonth],
  );

  const CalendarDayContent = useMemo(() => {
    const getKey = (date: Date) =>
      new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

    return function DayContent({ date }: DayContentProps) {
      const category = calendarData.labelByTime.get(getKey(date));

      return (
        <div className="flex h-full w-full flex-col items-center justify-center py-1">
          <span className="text-sm font-semibold leading-none">
            {date.getDate()}
          </span>
          {category ? (
            <span className="sr-only">
              {category === "present" ? "Presente" : "Ausente"}
            </span>
          ) : null}
        </div>
      );
    };
  }, [calendarData.labelByTime]);

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
          Seleccioná un alumno para revisar su porcentaje de asistencias y el
          detalle en el calendario del período activo.
        </p>
      </header>

      {alumnos.length > 1 && (
        <Tabs
          value={selectedMatriculaId ? String(selectedMatriculaId) : undefined}
          onValueChange={(value) => {
            const nextId = Number(value);
            if (!Number.isNaN(nextId)) {
              setSelectedMatriculaId(nextId);
            }
          }}
          className="w-full"
        >
          <TabsList className="flex flex-wrap gap-2 overflow-x-auto md:overflow-visible">
            {alumnos.map((al) => (
              <TabsTrigger
                key={al.matriculaId}
                value={String(al.matriculaId)}
                className="text-sm"
              >
                {al.nombreCompleto}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
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
                        <CircleCheck className="h-4 w-4 text-secondary" />
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
                      <div className="text-xs text-muted-foreground">
                        Total de días registrados: {resumen.total}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="h-full">
            <CardHeader>
              <CardTitle>Calendario de asistencias</CardTitle>
              <CardDescription>
                Visualizá rápidamente los días presentes y ausentes del
                período activo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingDetalles ? (
                <LoadingState label="Cargando calendario…" className="h-64" />
              ) : errorDetalles ? (
                <div className="text-sm text-red-600">{errorDetalles}</div>
              ) : (
                <div className="space-y-4">
                  <AttendanceCalendar
                    className="mx-auto w-full max-w-[30rem] rounded-lg border p-4"
                    classNames={{
                      months: "flex flex-col gap-4",
                      day: cn(
                        "m-1 flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors",
                        "aria-selected:opacity-100",
                      ),
                      day_today:
                        "border border-primary/40 text-primary aria-selected:bg-primary/15 aria-selected:text-primary",
                    }}
                    disableMonthDropdown
                    disableYearDropdown
                    defaultMonth={calendarDefaultMonth}
                    month={calendarMonth}
                    onMonthChange={handleCalendarMonthChange}
                    fromDate={calendarMinDate}
                    toDate={calendarMaxDate}
                    modifiers={calendarData.modifiers}
                    modifiersClassNames={calendarModifierClassNames}
                    components={{ DayContent: CalendarDayContent }}
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
