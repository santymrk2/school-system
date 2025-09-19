"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/dashboard/dashboard-layout";
import LoadingState from "@/components/common/LoadingState";
import { api } from "@/services/api";
import {
  JornadaAsistenciaDTO,
  DetalleAsistenciaDTO,
  DetalleAsistenciaCreateDTO,
  AlumnoLiteDTO,
  EstadoAsistencia,
  SeccionDTO,
} from "@/types/api-generated";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Row = {
  matriculaId: number;
  alumnoNombre: string;
  estado?: EstadoAsistencia;
  observacion?: string;
  detalleId?: number;
};

function formatTurnoLabel(turno?: string | null) {
  if (!turno) return "—";
  const map: Record<string, string> = {
    MANANA: "Mañana",
    TARDE: "Tarde",
  };
  return map[turno] ?? turno;
}

function formatFechaLabel(fecha?: string | null) {
  if (!fecha) return null;
  const date = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(date.getTime())) return fecha;
  const formatted = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function buildSeccionNombre(seccion: SeccionDTO | null, fallbackId: number) {
  if (seccion) {
    const nombre = `${seccion.gradoSala ?? ""} ${seccion.division ?? ""}`.trim();
    if (nombre) return nombre;
  }
  return fallbackId ? `Sección ${fallbackId}` : "Sección";
}

export default function JornadaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const jornadaId = Number(id);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Record<number, boolean>>({});

  const [jornada, setJornada] = useState<JornadaAsistenciaDTO | null>(null);
  const [seccion, setSeccion] = useState<SeccionDTO | null>(null);
  const [detalles, setDetalles] = useState<DetalleAsistenciaDTO[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const fecha = jornada?.fecha ?? "";
  const seccionId = jornada?.seccionId ?? 0;
  const seccionNombre = useMemo(
    () => buildSeccionNombre(seccion, seccionId),
    [seccion, seccionId],
  );
  const fechaLabel = useMemo(() => formatFechaLabel(fecha), [fecha]);
  const turnoLabel = useMemo(
    () => formatTurnoLabel(seccion?.turno),
    [seccion?.turno],
  );
  const totalAlumnos = rows.length;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);

      const j = (await api.jornadasAsistencia.byId(jornadaId)).data;
      setJornada(j);

      const [seccionResp, alumnosResp, detsResp] = await Promise.all([
        api.secciones.byId(j.seccionId),
        api.seccionesAlumnos.bySeccionId(j.seccionId, j.fecha),
        api.detallesAsistencia.byJornada(j.id),
      ]);

      const seccionData = (seccionResp.data ?? null) as SeccionDTO | null;
      setSeccion(seccionData);

      const alumnosData = (alumnosResp.data ?? []) as AlumnoLiteDTO[];

      const dets = detsResp.data ?? [];
      setDetalles(dets);

      const byMat: Record<number, DetalleAsistenciaDTO> = {};
      for (const d of dets) byMat[d.matriculaId] = d;

      const rowsData: Row[] = alumnosData
        .map((a) => {
          const det = byMat[a.matriculaId];
          const display = a.nombreCompleto || `Alumno #${a.matriculaId}`;
          return {
            matriculaId: a.matriculaId,
            alumnoNombre: display,
            estado: det?.estado,
            observacion: det?.observacion ?? undefined,
            detalleId: det?.id,
          };
        })
        .sort((r1, r2) => r1.alumnoNombre.localeCompare(r2.alumnoNombre));

      setRows(rowsData);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ?? e?.message ?? "Error cargando la jornada";
      setErr(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [jornadaId]);

  useEffect(() => {
    if (!Number.isFinite(jornadaId)) {
      setErr("El ID de jornada no es válido.");
      setLoading(false);
      return;
    }
    load();
  }, [jornadaId, load]);

  const handleEstadoChange = async (
    matriculaId: number,
    estado: EstadoAsistencia,
  ) => {
    const previousRow = rows.find((r) => r.matriculaId === matriculaId);
    if (!previousRow) return;
    const previousEstado = previousRow?.estado;
    const previousDetalleId = previousRow?.detalleId;
    const previousObservacion = previousRow?.observacion;
    const alreadySelected = previousEstado === estado;
    if (alreadySelected) return;

    const currentDetalle =
      previousDetalleId != null
        ? detalles.find((d) => d.id === previousDetalleId)
        : undefined;
    const observacion = currentDetalle?.observacion ?? previousObservacion ?? null;

    setRows((prev) =>
      prev.map((r) =>
        r.matriculaId === matriculaId
          ? { ...r, estado, observacion: observacion ?? undefined }
          : r,
      ),
    );
    setUpdating((prev) => ({ ...prev, [matriculaId]: true }));

    let targetDetalleId = previousDetalleId ?? null;

    try {
      if (targetDetalleId != null) {
        try {
          await api.detallesAsistencia.update(targetDetalleId, {
            estado,
            observacion,
          } as any);

          setDetalles((prev) => {
            const index = prev.findIndex((d) => d.id === targetDetalleId);
            if (index === -1) {
              return [
                ...prev,
                {
                  id: targetDetalleId,
                  jornadaId,
                  matriculaId,
                  estado,
                  observacion,
                } as DetalleAsistenciaDTO,
              ];
            }

            const next = [...prev];
            next[index] = {
              ...next[index],
              estado,
              observacion,
            };
            return next;
          });

          setRows((prev) =>
            prev.map((r) =>
              r.matriculaId === matriculaId
                ? {
                    ...r,
                    estado,
                    detalleId: targetDetalleId,
                    observacion: observacion ?? undefined,
                  }
                : r,
            ),
          );

          return;
        } catch (error: any) {
          if (error?.response?.status === 404) {
            setDetalles((prev) => prev.filter((d) => d.id !== targetDetalleId));
            setRows((prev) =>
              prev.map((r) =>
                r.matriculaId === matriculaId
                  ? { ...r, detalleId: undefined }
                  : r,
              ),
            );
            targetDetalleId = null;
          } else {
            throw error;
          }
        }
      }

      if (targetDetalleId == null) {
        const body: DetalleAsistenciaCreateDTO = {
          jornadaId,
          matriculaId,
          estado,
          observacion,
        } as any;

        const resp = await api.detallesAsistencia.create(body);
        const createdId = resp?.data;

        if (typeof createdId !== "number") {
          await load();
          return;
        }

        const newDetalle: DetalleAsistenciaDTO = {
          id: createdId,
          jornadaId,
          matriculaId,
          estado,
          observacion,
        } as DetalleAsistenciaDTO;

        setDetalles((prev) => [...prev, newDetalle]);
        setRows((prev) =>
          prev.map((r) =>
            r.matriculaId === matriculaId
              ? {
                  ...r,
                  estado,
                  detalleId: createdId,
                  observacion: observacion ?? undefined,
                }
              : r,
          ),
        );
      }
    } catch (e: any) {
      const status = e?.response?.status;
      const msg =
        e?.response?.data?.message ??
        e?.message ??
        "No se pudo actualizar la asistencia.";
      if (status === 403) {
        toast.error("No tenés permisos para modificar esta jornada.");
      } else {
        toast.error(msg);
      }

      setRows((prev) =>
        prev.map((r) =>
          r.matriculaId === matriculaId
            ? {
                ...r,
                estado: previousEstado,
                detalleId: previousDetalleId,
                observacion: previousObservacion,
              }
            : r,
        ),
      );
    } finally {
      setUpdating((prev) => {
        const next = { ...prev };
        delete next[matriculaId];
        return next;
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingState label="Cargando jornada…" />
      </DashboardLayout>
    );
  }

  if (err || !jornada) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>No se pudo cargar la jornada</CardTitle>
              <CardDescription>{err ?? "Jornada inexistente"}</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                Volver
              </Button>
              <Button onClick={load}>Reintentar</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6">
        <Button variant="outline" onClick={() => router.back()}>
          Volver
        </Button>

        <div className="space-y-2">
          <h2 className="text-3xl font-semibold">{seccionNombre}</h2>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {fechaLabel && <Badge variant="outline">{fechaLabel}</Badge>}
            {turnoLabel !== "—" && (
              <Badge variant="outline">Turno {turnoLabel}</Badge>
            )}
            <Badge variant="outline">
              {totalAlumnos} alumno{totalAlumnos === 1 ? "" : "s"}
            </Badge>
            <span className="text-xs text-muted-foreground">Jornada #{jornadaId}</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Marcá Presente/Ausente y los cambios se guardan automáticamente.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de alumnos</CardTitle>
            <CardDescription>
              Seleccioná Presente o Ausente para cada alumno. Los cambios se
              guardan automáticamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {rows.map((r) => {
              const isUpdating = Boolean(updating[r.matriculaId]);
              return (
                <div
                  key={r.matriculaId}
                  className="flex items-center justify-between border rounded-md p-3"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{r.alumnoNombre}</span>
                    {isUpdating && (
                      <span className="text-xs text-muted-foreground">
                        Guardando…
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={r.estado === "PRESENTE" ? "default" : "outline"}
                      disabled={isUpdating}
                      onClick={() => handleEstadoChange(r.matriculaId, "PRESENTE")}
                    >
                      Presente
                    </Button>
                    <Button
                      size="sm"
                      variant={r.estado === "AUSENTE" ? "default" : "outline"}
                      disabled={isUpdating}
                      onClick={() => handleEstadoChange(r.matriculaId, "AUSENTE")}
                    >
                      Ausente
                    </Button>
                  </div>
                </div>
              );
            })}

            {!rows.length && (
              <div className="text-sm text-muted-foreground">
                Sin alumnos activos.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
