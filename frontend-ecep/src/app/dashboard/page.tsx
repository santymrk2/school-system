"use client";

import { useState, useMemo, useEffect } from "react";
import LoadingState from "@/components/common/LoadingState";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  UserCheck,
  FileText,
  Ambulance,
  Bell,
  Megaphone,
  BellRing,
  TrendingUp,
  CircleCheck,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod"; // ← período activo + hoy
import { useVisibleMenu } from "@/hooks/useVisibleMenu";
import { useRecentMessages } from "@/hooks/useRecentMessages";
import { useQuickStats } from "@/hooks/useQuickStats";
import { useViewerScope } from "@/hooks/scope/useViewerScope";
import { useScopedSecciones } from "@/hooks/scope/useScopedSecciones";
import { useFamilyAlumnos } from "@/hooks/useFamilyAlumnos";
import { comunicacion } from "@/services/api/modules";
import type { ComunicadoDTO } from "@/types/api-generated";
import { UserRole } from "@/types/api-generated";
import {
  buildMisNiveles,
  buildMisSeccionesIds,
  filterVisibleComunicados,
  seccionIdFrom,
  splitComunicadosPorAlcance,
} from "@/lib/comunicados/visibility";
import { formatTurnoLabel } from "@/lib/turno-label";

const dateTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
});

function formatDateTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return dateTimeFormatter.format(date);
}

function comunicadoFecha(c: ComunicadoDTO): string | null {
  return c.fechaCreacion ?? c.fechaPublicacion ?? c.fechaProgPublicacion ?? null;
}

function preview(text?: string | null, max = 180) {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max)}…`;
}

function seccionLabelFrom(item: any): string | null {
  const grado =
    item?.gradoSala ??
    item?.grado ??
    item?.seccionActual?.gradoSala ??
    item?.seccion?.gradoSala ??
    "";
  const division =
    item?.division ??
    item?.seccionActual?.division ??
    item?.seccion?.division ??
    "";
  const base = `${grado ?? ""} ${division ?? ""}`.trim();
  const nombre =
    item?.nombre ??
    item?.seccionActual?.nombre ??
    item?.seccion?.nombre ??
    base;
  const turno =
    item?.turno ?? item?.seccionActual?.turno ?? item?.seccion?.turno ?? "";
  const turnoLabel = formatTurnoLabel(turno) ?? turno;
  const label = (nombre || base || null) as string | null;
  if (!label) return null;
  return turnoLabel ? `${label} (${turnoLabel})` : label;
}

// y usás: stats?.alumnosActivos, stats?.docentesActivos, etc.
// con fallback 0 mientras carga
export default function DashboardPage() {
  const { user } = useAuth();
  const { type, activeRole } = useViewerScope();
  const role = activeRole ?? null;

  const { periodoEscolarId } = useActivePeriod();
  const { secciones } = useScopedSecciones({
    periodoEscolarId: periodoEscolarId ?? undefined,
  });
  const { alumnos: hijos } = useFamilyAlumnos();

  const [comunicados, setComunicados] = useState<ComunicadoDTO[]>([]);
  const [loadingComunicados, setLoadingComunicados] = useState(true);

  // --------- MENSAJES RECIENTES ----------
  const { items: recentMsgs, loading: loadingMsgs } = useRecentMessages(5);

  const menuByRole = useVisibleMenu(role);

  // --------- STATS ----------
  const { data: stats, loading: loadingStats } = useQuickStats();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingComunicados(true);
        const res = await comunicacion.comunicados.list();
        if (!alive) return;
        setComunicados(res.data ?? []);
      } catch (error) {
        console.error("No se pudieron cargar los comunicados", error);
      } finally {
        if (alive) setLoadingComunicados(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const misSeccionesIds = useMemo(
    () => buildMisSeccionesIds(type, secciones, hijos) ?? new Set<number>(),
    [type, secciones, hijos],
  );

  const misNiveles = useMemo(
    () => buildMisNiveles(type, secciones, hijos) ?? new Set<string>(),
    [type, secciones, hijos],
  );

  const visiblesComunicados = useMemo(
    () =>
      filterVisibleComunicados({
        comunicados,
        type,
        role,
        misSeccionesIds,
        misNiveles,
        secciones,
        hijos,
      }),
    [comunicados, type, role, misSeccionesIds, misNiveles, secciones, hijos],
  );

  const sortedComunicados = useMemo(() => {
    return [...visiblesComunicados].sort((a, b) => {
      const fechaA = comunicadoFecha(a);
      const fechaB = comunicadoFecha(b);
      const timeA = fechaA ? new Date(fechaA).getTime() : 0;
      const timeB = fechaB ? new Date(fechaB).getTime() : 0;
      return timeB - timeA;
    });
  }, [visiblesComunicados]);

  const { generales, especificos } = useMemo(
    () => splitComunicadosPorAlcance(sortedComunicados),
    [sortedComunicados],
  );

  const generalesPreview = useMemo(
    () => generales.slice(0, 3),
    [generales],
  );

  const especificosPreview = useMemo(
    () => especificos.slice(0, 3),
    [especificos],
  );

  const seccionNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const item of secciones ?? []) {
      const id = seccionIdFrom(item) ?? item?.id;
      if (typeof id !== "number" || Number.isNaN(id)) continue;
      const label = seccionLabelFrom(item);
      if (label) {
        map.set(id, label);
      }
    }
    return map;
  }, [secciones]);

  // --------- QUICK ACTIONS (filtrado correcto) ----------
  const visibleQuickActions = useMemo(
    () =>
      menuByRole.filter(
        (a) => a.href !== "/dashboard" && a.href !== "/dashboard/",
      ),
    [menuByRole],
  );

  const canSeeStats =
    role === UserRole.DIRECTOR || role === UserRole.ADMIN;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Bienvenido al sistema de gestión escolar ECEP
            </p>
          </div>
        </div>

        {/* Estadísticas principales (5 cards) */}
        {canSeeStats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Alumnos Activos
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.alumnosActivos}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-secondary inline-flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {loadingStats ? "actualizando…" : "en período vigente"}
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Docentes Activos
                </CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.docentesActivos}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-blue-600 inline-flex items-center">
                    <CircleCheck className="h-3 w-3 mr-1" />
                    con asignación vigente
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Postulaciones
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.postulacionesPendientes}
                </div>
                <p className="text-xs text-muted-foreground">pendientes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Licencias Activas
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.licenciasActivas}
                </div>
                <p className="text-xs text-muted-foreground">vigentes hoy</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Actas sin firmar
                </CardTitle>
                <Ambulance className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.actasSinFirmar}</div>
                <p className="text-xs text-muted-foreground">en borrador</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Acciones rápidas */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>
                Accede rápidamente a las funciones principales del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {visibleQuickActions.map((action, index) => (
                  <Link
                    key={index}
                    href={action.href}
                    className="flex flex-col items-center rounded-lg p-4 group transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <div className={`mb-2 rounded-full bg-primary group-hover:bg-primary/80 transition-colors p-2 text-primary-foreground`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-center group-hover:text-gray-400 transition-colors">
                      {action.label}
                    </span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mensajes recientes */}
          <Card className="col-span-4 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                Mensajes Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingMsgs ? (
                <LoadingState label="Cargando mensajes…" />
              ) : recentMsgs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay mensajes recientes
                </p>
              ) : (
                <div className="space-y-3">
                  {recentMsgs.map((it) => (
                    <div
                      key={it.userId}
                      className="flex items-start gap-3 rounded p-2 transition-colors hover:bg-muted/70"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                        {it.nombre
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {it.nombre}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {it.lastMessage}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {/* opcional: formatear “hace X” */}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comunicados institucionales */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                Comunicados institucionales
              </CardTitle>
              <CardDescription>
                Últimos avisos publicados para toda la comunidad educativa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingComunicados ? (
                <LoadingState label="Cargando comunicados…" />
              ) : generalesPreview.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay comunicados institucionales recientes.
                </p>
              ) : (
                <div className="space-y-3">
                  {generalesPreview.map((comunicado) => (
                    <ComunicadoListItem
                      key={comunicado.id}
                      comunicado={comunicado}
                      seccionNameById={seccionNameById}
                    />
                  ))}
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <Link
                  href="/dashboard/comunicados"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Ver todos los comunicados
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Comunicados para tu nivel/sección */}
          <Card className="col-span-4 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BellRing className="h-4 w-4" />
                Avisos para vos
              </CardTitle>
              <CardDescription>
                Comunicados dirigidos a tus niveles o secciones asignadas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingComunicados ? (
                <LoadingState label="Cargando comunicados…" />
              ) : especificosPreview.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay comunicados específicos para tu perfil.
                </p>
              ) : (
                <div className="space-y-3">
                  {especificosPreview.map((comunicado) => (
                    <ComunicadoListItem
                      key={comunicado.id}
                      comunicado={comunicado}
                      seccionNameById={seccionNameById}
                    />
                  ))}
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <Link
                  href="/dashboard/comunicados"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Gestionar comunicados
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

  );
}

function ComunicadoListItem({
  comunicado,
  seccionNameById,
}: {
  comunicado: ComunicadoDTO;
  seccionNameById: Map<number, string>;
}) {
  const fecha = comunicadoFecha(comunicado);

  return (
    <div className="rounded-lg border border-border p-3 transition-colors hover:bg-muted/70">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold leading-snug">
            {comunicado.titulo ?? "Sin título"}
          </h4>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <ComunicadoScopeBadge
              comunicado={comunicado}
              seccionNameById={seccionNameById}
            />
          </div>
        </div>
        {fecha && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDateTime(fecha)}
          </span>
        )}
      </div>
      <div className="mt-2 text-sm text-muted-foreground">
        {preview(comunicado.cuerpo, 160)}
      </div>
    </div>
  );
}

function ComunicadoScopeBadge({
  comunicado,
  seccionNameById,
}: {
  comunicado: ComunicadoDTO;
  seccionNameById: Map<number, string>;
}) {
  if (comunicado.alcance === "INSTITUCIONAL") {
    return (
      <Badge variant="default">
        <Megaphone className="mr-1 h-3 w-3" /> Institucional
      </Badge>
    );
  }

  if (comunicado.alcance === "POR_NIVEL") {
    return <Badge variant="secondary">Nivel {comunicado.nivel}</Badge>;
  }

  if (comunicado.alcance === "POR_SECCION") {
    const id = comunicado.seccionId;
    const label =
      (typeof id === "number" && seccionNameById.get(id)) ||
      (typeof id === "number" ? `Sección ${id}` : "Sección");
    return <Badge variant="outline">{label}</Badge>;
  }

  return <Badge variant="outline">Comunicado</Badge>;
}
