"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/dashboard/dashboard-layout";
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
import { Calendar, ArrowLeft, Plus } from "lucide-react";
import { api } from "@/services/api";
import type {
  SeccionDTO,
  AsistenciaDiaDTO,
  AsistenciaAlumnoResumenDTO,
} from "@/types/api-generated";
import { toast } from "sonner";
import { ActiveTrimestreBadge } from "@/app/dashboard/_components/ActiveTrimestreBadge";

function fmt(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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

  // Rango por defecto: últimos 30 días (limitado al año actual)
  const today = new Date();
  const currentYear = today.getFullYear();
  const minDate = `${currentYear}-01-01`;
  const maxDate = `${currentYear}-12-31`;

  const clampToYear = (value: string) => {
    if (!value) return value;
    if (value < minDate) return minDate;
    if (value > maxDate) return maxDate;
    return value;
  };

  const initialFrom = clampToYear(
    fmt(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 30,
      ).toISOString(),
    ),
  );
  const initialTo = clampToYear(fmt(today.toISOString()));

  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [historial, setHistorial] = useState<AsistenciaDiaDTO[]>([]);
  const [resumen, setResumen] = useState<AsistenciaAlumnoResumenDTO[]>([]);

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

  const loadAll = async () => {
    try {
      setLoading(true);
      setErr(null);
      const [hRes, rRes] = await Promise.all([
        api.asistencias.historialSeccion(seccionId, from, to),
        api.asistencias.resumenPorAlumno(seccionId, from, to),
      ]);
      setHistorial(hRes.data ?? []);
      setResumen(rRes.data ?? []);
    } catch (e: any) {
      const msg =
        e?.response?.status === 400
          ? "Rango inválido o parámetros faltantes (from/to)."
          : e?.response?.status === 403
            ? "No tenés permisos para ver esta información (403)."
            : (e?.response?.data?.message ??
              e?.message ??
              "Error al cargar datos.");
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(seccionId)) return;
    if (!from || !to) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seccionId, from, to]);

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

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={from}
              min={minDate}
              max={maxDate}
              onChange={(e) => {
                let value = e.target.value;
                if (!value) {
                  setFrom(value);
                  return;
                }
                value = clampToYear(value);
                if (to && value > to) {
                  setTo(value);
                }
                setFrom(value);
              }}
              className="border rounded px-2 py-1 text-sm"
            />
            <span className="text-sm">→</span>
            <input
              type="date"
              value={to}
              min={minDate}
              max={maxDate}
              onChange={(e) => {
                let value = e.target.value;
                if (!value) {
                  setTo(value);
                  return;
                }
                value = clampToYear(value);
                if (from && value < from) {
                  setFrom(value);
                }
                setTo(value);
              }}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
        </div>

        {loading && <div className="text-sm">Cargando…</div>}
        {err && <div className="text-sm text-red-600">{err}</div>}

        {!loading && !err && (
          <>
            <Card>
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Jornadas en el rango
                  </CardTitle>
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
                      router.push(`/dashboard/asistencia/jornada/${jid}`)
                    }
                  />
                )}
              </CardHeader>

              <CardContent className="space-y-2">
                {historial.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No hay registros en el rango seleccionado.
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
                          toast.error("No hay jornada creada para esa fecha.");
                          return;
                        }
                        router.push(`/dashboard/asistencia/jornada/${jId}`);
                      } catch {
                        toast.error("No hay jornada creada para esa fecha.");
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
                  Porcentaje acumulado en el período
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {resumen.map((r) => (
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
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
