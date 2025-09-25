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
import { useViewerAlumnosLite } from "@/hooks/useViewerAlumnosLite";
import { asistencias } from "@/services/api/modules";
import type {
  AlumnoLiteDTO,
  DetalleAsistenciaDTO,
  JornadaAsistenciaDTO,
  NivelAcademico,
} from "@/types/api-generated";
import { NivelAcademico as NivelAcademicoEnum, UserRole } from "@/types/api-generated";
import { CheckCircle, Minus, X } from "lucide-react";

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

  useEffect(() => {
    let alive = true;

    async function fetchDetalles() {
      if (!alumnoSeleccionado) {
        setDetalles([]);
        setJornadas(new Map());
        setErrorDetalles(null);
        return;
      }

      try {
        setLoadingDetalles(true);
        setErrorDetalles(null);

        const { data } = await asistencias.detalles.search({
          matriculaId: alumnoSeleccionado.matriculaId,
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
  }, [alumnoSeleccionado]);

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
    return detalles
      .map((detalle) => {
        const jornada = detalle.jornadaId
          ? jornadas.get(detalle.jornadaId)
          : null;
        return {
          id: detalle.id,
          estado: detalle.estado,
          observacion: detalle.observacion,
          fecha: jornada?.fecha ?? null,
        };
      })
      .sort((a, b) => (b.fecha ?? "").localeCompare(a.fecha ?? ""));
  }, [detalles, jornadas]);

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
        <div className="grid gap-6 md:grid-cols-2">
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
                      <CheckCircle className="h-4 w-4 text-[hsl(var(--success))]" />
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
      )}
    </div>
  );
}

export default FamilyAttendanceView;
