"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LoadingState from "@/components/common/LoadingState";
import { useRouter } from "next/navigation";
import * as DTO from "@/types/api-generated";
import { UserRole } from "@/types/api-generated";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  Download,
  Search,
  TimerReset,
  UserPlus,
  XCircle,
} from "lucide-react";
import { useScopedIndex } from "@/hooks/scope/useScopedIndex";
import FamilyView from "./_components/FamilyView";
import AspirantesTab from "./_components/AspirantesTabs";
import { identidad, vidaEscolar } from "@/services/api/modules";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const TURNO_LABELS: Record<string, string> = {
  MANANA: "Mañana",
  TARDE: "Tarde",
};

function normalizeTurnoKey(turno: string) {
  return turno
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

function formatTurnoLabel(turno?: string | null) {
  if (!turno) return null;
  const trimmed = turno.trim();
  const normalized = normalizeTurnoKey(trimmed);
  if (normalized in TURNO_LABELS) {
    return TURNO_LABELS[normalized];
  }
  return trimmed;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanSeccionNombre(
  nombre?: string | null,
  turnoRaw?: string | null,
  turnoLabel?: string | null,
) {
  const base = nombre?.trim();
  if (!base) return undefined;

  const variants = [turnoRaw, turnoLabel]
    .flatMap((variant) => {
      const trimmed = variant?.trim();
      if (!trimmed) return [];
      const normalized = normalizeTurnoKey(trimmed);
      const values = [trimmed, trimmed.toLowerCase()];
      if (normalized) {
        values.push(normalized, normalized.toLowerCase());
      }
      return Array.from(new Set(values));
    })
    .filter((variant): variant is string => Boolean(variant));

  for (const variant of variants) {
    const core = escapeRegExp(variant);
    const pattern = new RegExp(
      `\\s*\\(\\s*(?:turno\\s+)?${core}\\s*\\)$`,
      "i",
    );
    const cleaned = base.replace(pattern, "").trim();
    if (cleaned !== base) {
      return cleaned || base;
    }
  }

  const fallbackPattern = /\s*\(\s*turno[^)]*\)\s*$/i;
  const cleaned = base.replace(fallbackPattern, "").trim();
  if (cleaned && cleaned !== base) {
    return cleaned;
  }

  return base;
}

export default function AlumnosIndexPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState<
    "alumnos" | "aspirantes" | "historial" | "bajas" | "avanzado"
  >("alumnos");

  const PAGE_SIZE = 25;
  const [alumnos, setAlumnos] = useState<DTO.AlumnoDTO[]>([]);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);
  const [errorAlumnos, setErrorAlumnos] = useState<string | null>(null);
  const [seccionFiltro, setSeccionFiltro] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [solicitudesBaja, setSolicitudesBaja] = useState<
    DTO.SolicitudBajaAlumnoDTO[]
  >([]);
  const [loadingSolicitudesBaja, setLoadingSolicitudesBaja] = useState(false);
  const [errorSolicitudesBaja, setErrorSolicitudesBaja] = useState<string | null>(
    null,
  );
  const [historialBajas, setHistorialBajas] = useState<
    DTO.SolicitudBajaAlumnoDTO[]
  >([]);
  const [loadingHistorialBajas, setLoadingHistorialBajas] = useState(false);
  const [errorHistorialBajas, setErrorHistorialBajas] = useState<string | null>(
    null,
  );
  const [processingSolicitudId, setProcessingSolicitudId] = useState<number | null>(
    null,
  );

  const {
    scope,
    loading,
    error,
    secciones,
    hijos,
    periodoNombre,
  } = useScopedIndex({ includeTitularSec: true });
  const { hasRole, user } = useAuth();

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (scope !== "teacher") return;
    if (!secciones.length) {
      setSeccionFiltro("");
      return;
    }
    if (seccionFiltro && secciones.some((s) => String(s.id) === seccionFiltro)) {
      return;
    }
    const first = secciones[0];
    if (first?.id) {
      setSeccionFiltro(String(first.id));
    }
  }, [scope, secciones, seccionFiltro]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, seccionFiltro, scope]);

  const canViewAspirantesHistorial =
    scope === "staff" &&
    (hasRole(UserRole.DIRECTOR) ||
      hasRole(UserRole.SECRETARY) ||
      hasRole(UserRole.ADMIN));

  const canManageBajas =
    scope === "staff" && (hasRole(UserRole.DIRECTOR) || hasRole(UserRole.ADMIN));

  const personaDecisorId = useMemo(
    () => user?.personaId ?? user?.id ?? null,
    [user],
  );

  const fetchSolicitudesBaja = useCallback(async () => {
    setLoadingSolicitudesBaja(true);
    setErrorSolicitudesBaja(null);
    try {
      const { data } = await vidaEscolar.solicitudesBaja.list();
      setSolicitudesBaja(data ?? []);
    } catch (error) {
      console.error(error);
      setErrorSolicitudesBaja("No se pudieron obtener las solicitudes de baja");
    } finally {
      setLoadingSolicitudesBaja(false);
    }
  }, []);

  const fetchHistorialBajas = useCallback(async () => {
    setLoadingHistorialBajas(true);
    setErrorHistorialBajas(null);
    try {
      const { data } = await vidaEscolar.solicitudesBaja.historial();
      setHistorialBajas(data ?? []);
    } catch (error) {
      console.error(error);
      setErrorHistorialBajas("No se pudo cargar el historial de bajas");
    } finally {
      setLoadingHistorialBajas(false);
    }
  }, []);

  useEffect(() => {
    if (canManageBajas) {
      fetchSolicitudesBaja();
    } else {
      setSolicitudesBaja([]);
    }
  }, [canManageBajas, fetchSolicitudesBaja]);

  useEffect(() => {
    if (canViewAspirantesHistorial || canManageBajas) {
      fetchHistorialBajas();
    } else {
      setHistorialBajas([]);
    }
  }, [canManageBajas, canViewAspirantesHistorial, fetchHistorialBajas]);

  const estadoLabels: Record<DTO.EstadoSolicitudBaja, string> = {
    [DTO.EstadoSolicitudBaja.PENDIENTE]: "Pendiente",
    [DTO.EstadoSolicitudBaja.APROBADA]: "Aprobada",
    [DTO.EstadoSolicitudBaja.RECHAZADA]: "Rechazada",
  };

  const estadoVariant: Record<DTO.EstadoSolicitudBaja, "default" | "secondary" | "destructive"> = {
    [DTO.EstadoSolicitudBaja.PENDIENTE]: "secondary",
    [DTO.EstadoSolicitudBaja.APROBADA]: "default",
    [DTO.EstadoSolicitudBaja.RECHAZADA]: "destructive",
  };

  const formatDecisionDate = (value?: string | null) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleString();
    } catch (error) {
      console.error(error);
      return value;
    }
  };

  const handleDownloadSolicitud = (sol: DTO.SolicitudBajaAlumnoDTO) => {
    if (typeof window === "undefined") return;

    const alumnoNombre = [sol.alumnoNombre, sol.alumnoApellido]
      .filter(Boolean)
      .join(" ")
      .trim();

    const payload = {
      id: sol.id,
      estado: sol.estado,
      motivo: sol.motivo,
      motivoRechazo: sol.motivoRechazo,
      fechaDecision: sol.fechaDecision,
      matriculaId: sol.matriculaId,
      periodoEscolarId: sol.periodoEscolarId,
      decididoPorPersonaId: sol.decididoPorPersonaId,
      alumno: {
        id: sol.alumnoId,
        nombre: sol.alumnoNombre,
        apellido: sol.alumnoApellido,
        dni: sol.alumnoDni,
        nombreCompleto: alumnoNombre || undefined,
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `solicitud-baja-${sol.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const ensurePersonaDecisor = () => {
    if (!personaDecisorId) {
      toast.error("No pudimos identificar a la persona que aprueba la solicitud");
      return false;
    }
    return true;
  };

  const handleApproveSolicitud = async (sol: DTO.SolicitudBajaAlumnoDTO) => {
    if (!ensurePersonaDecisor()) return;
    if (!window.confirm("¿Confirmás aprobar la baja del alumno?")) return;

    setProcessingSolicitudId(sol.id);
    try {
      await vidaEscolar.solicitudesBaja.approve(sol.id, {
        decididoPorPersonaId: personaDecisorId!,
      });
      toast.success("Solicitud aprobada correctamente");
      await Promise.all([fetchSolicitudesBaja(), fetchHistorialBajas()]);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo aprobar la solicitud");
    } finally {
      setProcessingSolicitudId(null);
    }
  };

  const handleRejectSolicitud = async (sol: DTO.SolicitudBajaAlumnoDTO) => {
    if (!ensurePersonaDecisor()) return;
    const reason = window.prompt(
      "Motivo del rechazo",
      sol.motivoRechazo ?? "",
    );
    if (reason == null) return;
    const normalized = reason.trim();
    if (!normalized) {
      toast.error("El motivo de rechazo es obligatorio");
      return;
    }

    setProcessingSolicitudId(sol.id);
    try {
      await vidaEscolar.solicitudesBaja.reject(sol.id, {
        decididoPorPersonaId: personaDecisorId!,
        motivoRechazo: normalized,
      });
      toast.success("Solicitud rechazada");
      await Promise.all([fetchSolicitudesBaja(), fetchHistorialBajas()]);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo rechazar la solicitud");
    } finally {
      setProcessingSolicitudId(null);
    }
  };

  useEffect(() => {
    if (
      (selectedTab === "aspirantes" || selectedTab === "historial") &&
      !canViewAspirantesHistorial
    ) {
      setSelectedTab("alumnos");
      return;
    }

    if (
      (selectedTab === "bajas" || selectedTab === "avanzado") &&
      !canManageBajas
    ) {
      setSelectedTab("alumnos");
    }
  }, [canManageBajas, canViewAspirantesHistorial, selectedTab]);

  useEffect(() => {
    if (scope === "family" || scope === "student") return;
    if (selectedTab !== "alumnos") return;

    if (scope === "teacher" && secciones.length === 0) {
      setLoadingAlumnos(false);
      setAlumnos([]);
      setTotalItems(0);
      setTotalPages(0);
      setErrorAlumnos(null);
      return;
    }

    const parsedSeccionId =
      seccionFiltro && seccionFiltro !== ""
        ? Number.parseInt(seccionFiltro, 10)
        : Number.NaN;
    const validSeccionId = Number.isFinite(parsedSeccionId)
      ? parsedSeccionId
      : undefined;

    if (scope === "teacher" && validSeccionId == null) {
      setLoadingAlumnos(false);
      setAlumnos([]);
      setTotalItems(0);
      setTotalPages(0);
      setErrorAlumnos(null);
      return;
    }

    let cancelled = false;
    setLoadingAlumnos(true);
    setErrorAlumnos(null);

    const params: {
      page: number;
      size: number;
      search?: string;
      seccionId?: number;
    } = {
      page,
      size: PAGE_SIZE,
    };

    const searchValue = debouncedSearch.trim();
    if (searchValue) {
      params.search = searchValue;
    }

    if (validSeccionId != null) {
      params.seccionId = validSeccionId;
    }

    identidad.alumnos
      .listPaged(params)
      .then((res) => {
        if (cancelled) return;
        const data = res.data;
        setAlumnos(data?.content ?? []);
        setTotalItems(data?.totalElements ?? 0);
        setTotalPages(data?.totalPages ?? 0);
        const nextPage = typeof data?.number === "number" ? data.number : page;
        if (nextPage !== page) {
          setPage(nextPage);
        }
        const reportedSize = typeof data?.size === "number" ? data.size : PAGE_SIZE;
        setPageSize(reportedSize);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setErrorAlumnos(err?.message ?? "No se pudieron cargar los alumnos");
        setAlumnos([]);
        setTotalItems(0);
        setTotalPages(0);
      })
      .finally(() => {
        if (!cancelled) setLoadingAlumnos(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    scope,
    selectedTab,
    secciones,
    seccionFiltro,
    debouncedSearch,
    page,
  ]);

  const teacherWithoutSecciones = scope === "teacher" && secciones.length === 0;
  const teacherNeedsSelection =
    scope === "teacher" && !teacherWithoutSecciones && !seccionFiltro;
  const seccionPlaceholder =
    scope === "teacher" ? "Seleccioná una sección" : "Todas las secciones";
  const showingFrom =
    totalItems === 0 || alumnos.length === 0 ? 0 : page * pageSize + 1;
  const showingTo =
    totalItems === 0 || alumnos.length === 0
      ? 0
      : Math.min(showingFrom + alumnos.length - 1, totalItems);

  const bajasPendientes = useMemo(
    () =>
      solicitudesBaja.filter(
        (sol) => sol.estado === DTO.EstadoSolicitudBaja.PENDIENTE,
      ),
    [solicitudesBaja],
  );

  const bajasAprobadas = useMemo(
    () =>
      solicitudesBaja.filter(
        (sol) => sol.estado === DTO.EstadoSolicitudBaja.APROBADA,
      ),
    [solicitudesBaja],
  );

  const bajasRechazadas = useMemo(
    () =>
      solicitudesBaja.filter(
        (sol) => sol.estado === DTO.EstadoSolicitudBaja.RECHAZADA,
      ),
    [solicitudesBaja],
  );

  const ultimasBajas = useMemo(
    () => historialBajas.slice(0, 5),
    [historialBajas],
  );

  const seccionOptions = useMemo(() => {
    if (secciones.length) {
      return secciones.map((s) => ({
        id: String(s.id),
        label: `${s.gradoSala ?? ""} ${s.division ?? ""}`.trim() +
          (s.turno ? ` (${s.turno})` : ""),
      }));
    }
    const map = new Map<string, string>();
    alumnos.forEach((a) => {
      if (a.seccionActualId && a.seccionActualNombre) {
        map.set(String(a.seccionActualId), a.seccionActualNombre);
      }
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [secciones, alumnos]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Alumnos</h2>
            {scope === "staff" ? (
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">
                  Período {periodoNombre ?? "—"}
                </Badge>
              </div>
            ) : (
              <div className="text-muted-foreground">
                {scope === "teacher"
                  ? "Gestión de alumnos por sección"
                  : scope === "student"
                    ? "Consulta de mi información académica"
                    : "Vista de hijos y perfiles"}
              </div>
            )}
          </div>
          {scope === "staff" && (
            <div className="flex items-center space-x-2">
              <Button onClick={() => router.push("/dashboard/alumnos/alta")}>
                <UserPlus className="h-4 w-4 mr-2" />
                Alta Manual
              </Button>
            </div>
          )}
        </div>

        {/* Search global (para Aspirantes / Historial) */}
        {canViewAspirantesHistorial && (
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, curso o sección…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {loading && <LoadingState label="Cargando información…" />}
        {error && <div className="text-sm text-red-600">{String(error)}</div>}

        {/* FAMILY / STUDENT: lista de hijos o matrícula propia */}
        {!loading && !error && (scope === "family" || scope === "student") && (
          <FamilyView
            hijos={hijos}
            title={scope === "student" ? "Mi matrícula" : "Mis hijos/as"}
          />
        )}

        {/* STAFF / TEACHER: Tabs */}
        {!loading &&
          !error &&
          (scope === "staff" || scope === "teacher") && (
          <Tabs
            value={selectedTab}
            onValueChange={(v) => {
              if (
                (v === "aspirantes" || v === "historial") &&
                !canViewAspirantesHistorial
              ) {
                setSelectedTab("alumnos");
                return;
              }
              if ((v === "bajas" || v === "avanzado") && !canManageBajas) {
                setSelectedTab("alumnos");
                return;
              }
              setSelectedTab(v as any);
            }}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="alumnos">Alumnos</TabsTrigger>
              {canViewAspirantesHistorial && (
                <>
                  <TabsTrigger value="aspirantes">Aspirantes</TabsTrigger>
                  <TabsTrigger value="historial">Historial</TabsTrigger>
                </>
              )}
              {canManageBajas && (
                <>
                  <TabsTrigger value="avanzado">Avanzado</TabsTrigger>
                  <TabsTrigger value="bajas">Bajas</TabsTrigger>
                </>
              )}
            </TabsList>

            <TabsContent value="alumnos" className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Select
                  value={seccionFiltro || undefined}
                  onValueChange={(value) =>
                    setSeccionFiltro(value === "__all" ? "" : value)
                  }
                  disabled={teacherWithoutSecciones}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder={seccionPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {scope === "staff" && (
                      <SelectItem value="__all">Todas las secciones</SelectItem>
                    )}
                    {seccionOptions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {scope === "staff" && seccionFiltro && (
                  <Badge variant="outline">Filtrando por sección</Badge>
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Listado de alumnos</CardTitle>
                  <CardDescription>
                    Seleccioná un alumno para ver su ficha completa.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {teacherWithoutSecciones ? (
                    <div className="text-sm text-muted-foreground py-6">
                      No tenés secciones asignadas para ver alumnos.
                    </div>
                  ) : teacherNeedsSelection ? (
                    <div className="text-sm text-muted-foreground py-6">
                      Seleccioná una sección para ver los alumnos asignados.
                    </div>
                  ) : loadingAlumnos ? (
                    <LoadingState label="Cargando alumnos…" />
                  ) : errorAlumnos ? (
                    <div className="text-sm text-red-600 py-6">{errorAlumnos}</div>
                  ) : alumnos.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-6">
                      No se encontraron alumnos con los filtros aplicados.
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {alumnos.map((alumno) => {
                          const alumnoId = alumno.id;
                          const nombre = alumno.nombre?.trim() || "—";
                          const apellido = alumno.apellido?.trim() || "—";
                          const dni = alumno.dni?.trim() || "—";
                          const turnoRaw = alumno.seccionActualTurno?.trim();
                          const turnoLabel = formatTurnoLabel(turnoRaw);
                          const seccionNombre =
                            cleanSeccionNombre(
                              alumno.seccionActualNombre,
                              turnoRaw,
                              turnoLabel,
                            ) || "Sin asignar";
                          const turno = turnoLabel ?? turnoRaw ?? "—";

                          return (
                            <button
                              key={alumnoId ?? `${nombre}-${apellido}-${dni}`}
                              type="button"
                              onClick={() =>
                                alumnoId && router.push(`/dashboard/alumnos/${alumnoId}`)
                              }
                              className="h-full w-full rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                            >
                              <Card className="h-full border transition-colors hover:border-primary hover:shadow-md">
                                <CardContent className="space-y-4 pt-6 text-sm">
                                  <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
                                    <dl className="grid gap-1">
                                      <dt className="text-xs font-medium uppercase text-muted-foreground">
                                        Nombre
                                      </dt>
                                      <dd className="text-base font-semibold text-foreground">
                                        {nombre}
                                      </dd>
                                    </dl>
                                    <dl className="grid gap-1">
                                      <dt className="text-xs font-medium uppercase text-muted-foreground">
                                        Apellido
                                      </dt>
                                      <dd className="text-base font-semibold text-foreground">
                                        {apellido}
                                      </dd>
                                    </dl>
                                  </div>
                                  <dl className="grid gap-1">
                                    <dt className="text-xs font-medium uppercase text-muted-foreground">
                                      DNI
                                    </dt>
                                    <dd className="text-base font-semibold text-foreground">
                                      {dni}
                                    </dd>
                                  </dl>
                                  <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
                                    <dl className="grid gap-1">
                                      <dt className="text-xs font-medium uppercase text-muted-foreground">
                                        Sección actual
                                      </dt>
                                      <dd className="text-base font-semibold text-foreground">
                                        {seccionNombre}
                                      </dd>
                                    </dl>
                                    <dl className="grid gap-1">
                                      <dt className="text-xs font-medium uppercase text-muted-foreground">
                                        Turno
                                      </dt>
                                      <dd className="text-base font-semibold text-foreground">
                                        {turno}
                                      </dd>
                                    </dl>
                                  </div>
                                </CardContent>
                              </Card>
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-4 flex flex-col gap-2 border-t pt-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                        <div>
                          Mostrando {showingFrom}-{showingTo} de {totalItems} alumno
                          {totalItems === 1 ? "" : "s"}.
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                            disabled={page === 0 || loadingAlumnos}
                          >
                            Anterior
                          </Button>
                          <div>
                            Página {totalPages === 0 ? 0 : page + 1} de {totalPages}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPage((prev) => {
                                if (totalPages === 0) return prev;
                                return Math.min(totalPages - 1, Math.max(0, prev + 1));
                              })
                            }
                            disabled={
                              totalPages === 0 || page >= totalPages - 1 || loadingAlumnos
                            }
                          >
                            Siguiente
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aspirantes */}
            {canViewAspirantesHistorial && (
              <TabsContent value="aspirantes" className="space-y-4">
                <AspirantesTab searchTerm={searchTerm} />
              </TabsContent>
            )}

            {/* Avanzado */}
            {canManageBajas && (
              <TabsContent value="avanzado" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Pendientes
                      </CardTitle>
                      <TimerReset className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {bajasPendientes.length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Solicitudes en revisión
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Aprobadas
                      </CardTitle>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {bajasAprobadas.length || historialBajas.length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Incluye las del historial reciente
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Rechazadas
                      </CardTitle>
                      <XCircle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {bajasRechazadas.length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Últimos rechazos registrados
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>Resumen ejecutivo</CardTitle>
                      <CardDescription>
                        Seguimiento ágil de las decisiones tomadas sobre bajas.
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        fetchSolicitudesBaja();
                        fetchHistorialBajas();
                      }}
                    >
                      <TimerReset className="mr-2 h-4 w-4" /> Actualizar
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg border p-4">
                        <h4 className="text-sm font-semibold text-foreground">
                          Tiempo de respuesta
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {bajasPendientes.length === 0
                            ? "Todas las solicitudes están actualizadas"
                            : "Hay solicitudes pendientes de revisión"}
                        </p>
                      </div>
                      <div className="rounded-lg border p-4">
                        <h4 className="text-sm font-semibold text-foreground">
                          Historial registrado
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {historialBajas.length}
                          {" "}
                          bajas confirmadas disponibles para consulta.
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2">
                        Últimas aprobaciones
                      </h4>
                      {ultimasBajas.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          Aún no registraste aprobaciones de baja.
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {ultimasBajas.map((sol) => {
                            const estado = sol.estado ?? DTO.EstadoSolicitudBaja.APROBADA;
                            const nombre =
                              [sol.alumnoApellido, sol.alumnoNombre]
                                .filter(Boolean)
                                .join(", ") ||
                              "Alumno sin datos";
                            return (
                              <li
                                key={sol.id}
                                className="flex flex-col gap-1 rounded border border-border/60 bg-muted/40 p-3 text-sm"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span className="font-medium text-foreground">
                                    {nombre}
                                  </span>
                                  <Badge variant={estadoVariant[estado]}>
                                    {estadoLabels[estado]}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDecisionDate(sol.fechaDecision)}
                                </div>
                                {sol.motivo && (
                                  <p className="text-xs text-muted-foreground">
                                    Motivo: {sol.motivo}
                                  </p>
                                )}
                                <div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="px-0 text-xs"
                                    onClick={() => handleDownloadSolicitud(sol)}
                                  >
                                    <Download className="mr-1 h-3 w-3" />
                                    Descargar ficha
                                  </Button>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Bajas */}
            {canManageBajas && (
              <TabsContent value="bajas" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>Solicitudes de baja</CardTitle>
                      <CardDescription>
                        Gestioná las bajas enviadas por alumnos y familias.
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchSolicitudesBaja}
                    >
                      <TimerReset className="mr-2 h-4 w-4" /> Actualizar
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {loadingSolicitudesBaja ? (
                      <LoadingState label="Cargando solicitudes…" />
                    ) : errorSolicitudesBaja ? (
                      <div className="text-sm text-red-600">
                        {errorSolicitudesBaja}
                      </div>
                    ) : solicitudesBaja.length === 0 ? (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        No hay solicitudes de baja registradas.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                              <th className="py-2 pr-4 font-medium">Alumno</th>
                              <th className="py-2 pr-4 font-medium">Motivo</th>
                              <th className="py-2 pr-4 font-medium">Estado</th>
                              <th className="py-2 pr-4 font-medium">Decisión</th>
                              <th className="py-2 pr-4 font-medium">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {solicitudesBaja.map((sol) => {
                              const estado =
                                sol.estado ?? DTO.EstadoSolicitudBaja.PENDIENTE;
                              const nombre =
                                [sol.alumnoApellido, sol.alumnoNombre]
                                  .filter(Boolean)
                                  .join(", ") ||
                                "Alumno sin datos";
                              return (
                                <tr
                                  key={sol.id}
                                  className="border-t border-border/60 align-top"
                                >
                                  <td className="py-3 pr-4">
                                    <div className="font-medium text-foreground">
                                      {nombre}
                                    </div>
                                    {sol.alumnoDni && (
                                      <div className="text-xs text-muted-foreground">
                                        DNI {sol.alumnoDni}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3 pr-4 max-w-xs">
                                    <div className="text-sm text-muted-foreground whitespace-pre-line">
                                      {sol.motivo || "—"}
                                    </div>
                                    {sol.motivoRechazo && (
                                      <div className="mt-1 text-xs text-destructive">
                                        Rechazo: {sol.motivoRechazo}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3 pr-4">
                                    <Badge variant={estadoVariant[estado]}>
                                      {estadoLabels[estado]}
                                    </Badge>
                                  </td>
                                  <td className="py-3 pr-4 text-sm text-muted-foreground">
                                    <div>{formatDecisionDate(sol.fechaDecision)}</div>
                                    {sol.decididoPorPersonaId && (
                                      <div className="text-xs">
                                        Decidido por #{sol.decididoPorPersonaId}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3 pr-4">
                                    <div className="flex flex-wrap gap-2">
                                      {estado ===
                                        DTO.EstadoSolicitudBaja.PENDIENTE && (
                                        <>
                                          <Button
                                            size="sm"
                                            onClick={() =>
                                              handleApproveSolicitud(sol)
                                            }
                                            disabled={
                                              processingSolicitudId === sol.id
                                            }
                                          >
                                            Aprobar
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() =>
                                              handleRejectSolicitud(sol)
                                            }
                                            disabled={
                                              processingSolicitudId === sol.id
                                            }
                                          >
                                            Rechazar
                                          </Button>
                                        </>
                                      )}
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDownloadSolicitud(sol)}
                                      >
                                        <Download className="mr-2 h-3 w-3" />
                                        Descargar
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Historial */}
            {canViewAspirantesHistorial && (
              <TabsContent value="historial" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>Historial de bajas</CardTitle>
                      <CardDescription>
                        Registro de bajas aceptadas con detalle de motivos y fechas.
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchHistorialBajas}
                    >
                      <TimerReset className="mr-2 h-4 w-4" /> Actualizar
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {loadingHistorialBajas ? (
                      <LoadingState label="Cargando historial…" />
                    ) : errorHistorialBajas ? (
                      <div className="text-sm text-red-600">
                        {errorHistorialBajas}
                      </div>
                    ) : historialBajas.length === 0 ? (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        Todavía no hay bajas confirmadas.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                              <th className="py-2 pr-4 font-medium">Alumno</th>
                              <th className="py-2 pr-4 font-medium">Motivo</th>
                              <th className="py-2 pr-4 font-medium">Fecha decisión</th>
                              <th className="py-2 pr-4 font-medium">Descarga</th>
                            </tr>
                          </thead>
                          <tbody>
                            {historialBajas.map((sol) => {
                              const estado =
                                sol.estado ?? DTO.EstadoSolicitudBaja.APROBADA;
                              const nombre =
                                [sol.alumnoApellido, sol.alumnoNombre]
                                  .filter(Boolean)
                                  .join(", ") ||
                                "Alumno sin datos";
                              return (
                                <tr
                                  key={sol.id}
                                  className="border-t border-border/60 align-top"
                                >
                                  <td className="py-3 pr-4">
                                    <div className="font-medium text-foreground">
                                      {nombre}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                      <span>
                                        {sol.alumnoDni ? `DNI ${sol.alumnoDni}` : "Sin documento"}
                                      </span>
                                      <Badge variant={estadoVariant[estado]}>
                                        {estadoLabels[estado]}
                                      </Badge>
                                    </div>
                                  </td>
                                  <td className="py-3 pr-4 max-w-md text-sm text-muted-foreground whitespace-pre-line">
                                    {sol.motivo || "—"}
                                  </td>
                                  <td className="py-3 pr-4 text-sm text-muted-foreground">
                                    {formatDecisionDate(sol.fechaDecision)}
                                  </td>
                                  <td className="py-3 pr-4">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDownloadSolicitud(sol)}
                                    >
                                      <Download className="mr-2 h-3 w-3" />
                                      Descargar
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>

  );
}
