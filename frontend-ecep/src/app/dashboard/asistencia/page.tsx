"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/dashboard/dashboard-layout";
import LoadingState from "@/components/common/LoadingState";
import { UserRole, SeccionDTO, Turno } from "@/types/api-generated";
import { useScopedSecciones } from "@/hooks/scope/useScopedSecciones";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod";
import { gestionAcademica } from "@/services/api/modules";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NewJornadaDialog } from "@/app/dashboard/asistencia/_components/NewJornadaDialog";
import { ActiveTrimestreBadge } from "@/app/dashboard/_components/ActiveTrimestreBadge";
import FamilyAttendanceView from "@/app/dashboard/asistencia/_components/FamilyAttendanceView";
import { useViewerScope } from "@/hooks/scope/useViewerScope";

/* =========================
   PAGE
========================= */
export default function AsistenciaPage() {
  const { type, activeRole } = useViewerScope();
  const isAdmin = activeRole === UserRole.ADMIN;
  const isTeacher = type === "teacher";
  const isStaff = type === "staff" && !isAdmin;
  const isFamily = type === "family";
  const isStudent = type === "student";

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Asistencia</h2>
            <p className="text-muted-foreground">
              {isAdmin
                ? "Sin acceso"
                : isTeacher
                  ? "Tus secciones asignadas"
                  : isStaff
                    ? "Dirección — Seguimiento integral por secciones y alumnos"
                    : "Consulta"}
            </p>
            <ActiveTrimestreBadge className="mt-2" />
          </div>
        </header>

        {isAdmin ? (
          <div className="p-6 text-sm">403 — El perfil de Administración no tiene acceso a Asistencia.</div>
        ) : isTeacher ? (
          <TeacherView />
        ) : isStaff ? (
          <DirectivoView />
        ) : isFamily || isStudent ? (
          <FamilyAttendanceView />
        ) : (
          <FamilyAttendanceView />
        )}
      </div>
    </DashboardLayout>
  );
}

function useSectionStudentCounts(secciones: SeccionDTO[]) {
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    if (!secciones.length) {
      setCounts({});
      setError(null);
      setLoading(false);
      return () => {
        alive = false;
      };
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const today = new Date().toISOString().slice(0, 10);
        let hadPartialError = false;

        const entries = await Promise.all(
          secciones.map(async (s) => {
            try {
              const resp = await gestionAcademica.seccionesAlumnos.bySeccionId(s.id, today);
              const alumnos = resp.data ?? [];
              return [s.id, alumnos.length] as const;
            } catch (e) {
              hadPartialError = true;
              return [s.id, 0] as const;
            }
          }),
        );

        if (!alive) return;
        setCounts(Object.fromEntries(entries));
        setError(
          hadPartialError
            ? "No se pudo obtener el recuento de alumnos en todas las secciones."
            : null,
        );
      } catch (e: any) {
        if (!alive) return;
        setError(
          e?.response?.data?.message ??
            e?.message ??
            "No se pudo obtener el recuento de alumnos.",
        );
        setCounts({});
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [secciones]);

  return { counts, loading, error } as const;
}

function formatTurnoLabel(turno?: string | null) {
  if (!turno) return "—";
  const map: Record<string, string> = {
    [Turno.MANANA]: "Mañana",
    [Turno.TARDE]: "Tarde",
  };
  return map[turno] ?? turno;
}

/* =========================
   DOCENTE
========================= */
function TeacherView() {
  const router = useRouter();
  const { loading, error, secciones } = useScopedSecciones();
  const {
    counts,
    loading: countsLoading,
    error: countsError,
  } = useSectionStudentCounts(secciones);

  if (loading) return <LoadingState label="Cargando secciones…" />;
  if (error) return <div className="text-sm text-red-600">{String(error)}</div>;
  if (!secciones.length)
    return <div className="text-sm">No tenés secciones asignadas.</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {countsError && (
        <div className="md:col-span-2 lg:col-span-3 text-sm text-red-600">
          {countsError}
        </div>
      )}
      {secciones.map((seccion) => {
        const count = counts[seccion.id];
        const countLabel =
          count != null
            ? `${count} alumno${count === 1 ? "" : "s"}`
            : countsLoading
              ? "Cargando alumnos…"
              : "Sin datos";
        const turnoLabel = formatTurnoLabel(seccion.turno);

        return (
          <Card key={seccion.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {seccion.gradoSala} {seccion.division}
                </CardTitle>
                <Badge variant="secondary">{turnoLabel}</Badge>
              </div>
              <CardDescription>{countLabel}</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <NewJornadaDialog
                seccion={seccion}
                onCreated={(jornadaId) =>
                  router.push(`/dashboard/asistencia/jornada/${jornadaId}`)
                }
              />
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/dashboard/asistencia/seccion/${seccion.id}`)
                }
              >
                Historial
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/* =========================
   DIRECCIÓN — GLOBAL
========================= */
function DirectivoView() {
  const router = useRouter();
  const { periodoEscolarId } = useActivePeriod();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [secciones, setSecciones] = useState<SeccionDTO[]>([]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const secAll = (await gestionAcademica.secciones.list()).data ?? [];
        const secs = periodoEscolarId
          ? (secAll as SeccionDTO[]).filter(
              (s: any) => s.periodoEscolarId === periodoEscolarId,
            )
          : (secAll as SeccionDTO[]);

        if (!alive) return;
        setSecciones(secs);
      } catch (e: any) {
        if (!alive) return;
        setErr(
          e?.response?.data?.message ??
            e?.message ??
            "No se pudo cargar las secciones.",
        );
        setSecciones([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [periodoEscolarId]);

  const {
    counts,
    loading: countsLoading,
    error: countsError,
  } = useSectionStudentCounts(secciones);

  const seccionesOrdenadas = useMemo(() => {
    return [...secciones].sort((a, b) => {
      const nombreA = `${a.gradoSala ?? ""} ${a.division ?? ""}`.trim();
      const nombreB = `${b.gradoSala ?? ""} ${b.division ?? ""}`.trim();
      return (
        nombreA.localeCompare(nombreB, "es") ||
        (a.turno ?? "").localeCompare(b.turno ?? "", "es")
      );
    });
  }, [secciones]);

  return (
    <div className="space-y-4">
      {loading && <LoadingState label="Cargando secciones…" />}
      {err && <div className="text-sm text-red-600">{err}</div>}
      {countsError && <div className="text-sm text-red-600">{countsError}</div>}

      {!loading && !seccionesOrdenadas.length && (
        <div className="text-sm text-muted-foreground">
          No hay secciones disponibles.
        </div>
      )}

      {!!seccionesOrdenadas.length && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {seccionesOrdenadas.map((s) => {
            const nombre = `${s.gradoSala ?? ""} ${s.division ?? ""}`.trim();
            const turnoLabel = formatTurnoLabel(s.turno);
            const count = counts[s.id];
            const label =
              count != null
                ? `${count} alumno${count === 1 ? "" : "s"}`
                : countsLoading
                  ? "Cargando alumnos…"
                  : "Sin datos";

            return (
              <Card
                key={s.id}
                className="transition-shadow cursor-pointer hover:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={() =>
                  router.push(`/dashboard/asistencia/seccion/${s.id}`)
                }
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center justify-between">
                    {nombre || `Sección #${s.id}`}
                    <Badge variant="secondary">{turnoLabel}</Badge>
                  </CardTitle>
                  <CardDescription>{label}</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2">
                  {/*
                  <NewJornadaDialog
                    seccion={s}
                    onCreated={(jornadaId) =>
                      router.push(`/dashboard/asistencia/jornada/${jornadaId}`)
                    }
                  />

                  */}
                  {/*
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(`/dashboard/asistencia/seccion/${s.id}`)
                    }
                  >
                    Ver sección
                  </Button>
                  */}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
