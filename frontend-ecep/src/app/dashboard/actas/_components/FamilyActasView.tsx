"use client";

import { useEffect, useMemo, useState } from "react";
import LoadingState from "@/components/common/LoadingState";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ActaAccidenteDTO, AlumnoLiteDTO } from "@/types/api-generated";
import { vidaEscolar } from "@/services/api/modules";

interface FamilyActasViewProps {
  alumnos: AlumnoLiteDTO[];
  initialLoading?: boolean;
  initialError?: string | null;
}

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return dateFormatter.format(parsed);
}

function formatTime(value?: string | null) {
  if (!value) return "—";
  const base = value.length === 5 ? `${value}:00` : value;
  const parsed = new Date(`1970-01-01T${base}`);
  if (Number.isNaN(parsed.getTime())) return value;
  return timeFormatter.format(parsed);
}

function estadoInfo(estado?: string | null) {
  const normalized = String(estado ?? "").toUpperCase();
  if (normalized === "CERRADA") {
    return { label: "Firmada", variant: "default" as const };
  }
  if (normalized === "BORRADOR") {
    return { label: "Pendiente", variant: "outline" as const };
  }
  if (!normalized) {
    return { label: "Sin estado", variant: "secondary" as const };
  }
  return { label: normalized, variant: "secondary" as const };
}

export default function FamilyActasView({
  alumnos,
  initialLoading,
  initialError,
}: FamilyActasViewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actas, setActas] = useState<ActaAccidenteDTO[]>([]);

  useEffect(() => {
    if (!alumnos.length) {
      setActas([]);
      setError(null);
      setLoading(false);
      return;
    }

    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await vidaEscolar.actasAccidente.list().catch(() => ({ data: [] }));
        if (!alive) return;
        setActas(res.data ?? []);
      } catch (err: any) {
        if (!alive) return;
        setError(
          err?.response?.data?.message ??
            err?.message ??
            "No se pudo obtener el listado de actas.",
        );
        setActas([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [alumnos]);

  const actasPorAlumno = useMemo(() => {
    const map = new Map<number, ActaAccidenteDTO[]>();
    for (const acta of actas) {
      const alumnoId = acta.alumnoId ?? (acta as any).alumno?.id ?? null;
      if (alumnoId == null) continue;
      const lista = map.get(alumnoId) ?? [];
      lista.push(acta);
      map.set(alumnoId, lista);
    }
    for (const lista of map.values()) {
      lista.sort((a, b) => (b.fechaSuceso ?? "").localeCompare(a.fechaSuceso ?? ""));
    }
    return map;
  }, [actas]);

  if (initialLoading) {
    return <LoadingState label="Cargando actas…" />;
  }

  if (initialError) {
    return <div className="text-sm text-red-600">{initialError}</div>;
  }

  if (!alumnos.length) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        No hay alumnos asociados a esta cuenta.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loading && <LoadingState label="Cargando actas…" />}
      {error && !loading && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {!loading &&
        alumnos.map((alumno) => {
          const actasAlumno = actasPorAlumno.get(alumno.alumnoId ?? -1) ?? [];
          return (
            <Card key={`${alumno.matriculaId}-${alumno.alumnoId}`}>
              <CardHeader>
                <CardTitle>{alumno.nombreCompleto}</CardTitle>
                <CardDescription>
                  Matrícula #{alumno.matriculaId} — {alumno.seccionNombre ?? "Sin sección"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {actasAlumno.length ? (
                  actasAlumno.map((acta) => {
                    const estado = estadoInfo((acta as any).estado);
                    return (
                      <div
                        key={acta.id}
                        className="rounded-lg border p-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold">
                              {formatDate(acta.fechaSuceso)} • {formatTime((acta as any).horaSuceso)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Lugar: {(acta as any).lugar ?? "No registrado"}
                            </p>
                          </div>
                          <Badge variant={estado.variant}>{estado.label}</Badge>
                        </div>
                        <div className="mt-3 space-y-2 text-sm text-muted-foreground whitespace-pre-line">
                          <div>
                            <span className="font-medium text-foreground">Descripción:</span>{" "}
                            {acta.descripcion?.trim() || "No se registró una descripción."}
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Acciones realizadas:</span>{" "}
                            {(acta as any).acciones?.trim() || "Sin acciones registradas."}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No se registraron actas para este alumno.
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}
