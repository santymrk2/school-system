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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Download, Search, TimerReset, UserPlus } from "lucide-react";
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
    "alumnos" | "aspirantes" | "historial" | "bajas"
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
  const [processingRevisionId, setProcessingRevisionId] = useState<number | null>(
    null,
  );
  const [estadoSolicitudesFiltro, setEstadoSolicitudesFiltro] = useState<
    "all" | DTO.EstadoSolicitudBaja
  >("all");
  const [crearBajaOpen, setCrearBajaOpen] = useState(false);
  const [crearBajaMotivo, setCrearBajaMotivo] = useState("");
  const [crearBajaMatriculaId, setCrearBajaMatriculaId] = useState<number | null>(
    null,
  );
  const [crearBajaLoading, setCrearBajaLoading] = useState(false);
  const [matriculaOptions, setMatriculaOptions] = useState<
    {
      value: number;
      label: string;
      seccion?: string | null;
    }[]
  >([]);
  const [matriculasLoading, setMatriculasLoading] = useState(false);
  const [matriculasError, setMatriculasError] = useState<string | null>(null);

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
  const canReviewBajasAdministracion =
    scope === "staff" && hasRole(UserRole.ADMIN);
  const canDecideBajasDireccion =
    scope === "staff" && hasRole(UserRole.DIRECTOR);

  const personaActualId = useMemo(
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

  const loadMatriculas = useCallback(
    async (signal?: { cancelled: boolean }) => {
      if (!canManageBajas) {
        setMatriculaOptions([]);
        setMatriculasError(null);
        setMatriculasLoading(false);
        return;
      }

      setMatriculasLoading(true);
      setMatriculasError(null);

      try {
        const [matriculasRes, alumnosRes] = await Promise.all([
          vidaEscolar.matriculas.list(),
          identidad.alumnos.list(),
        ]);
        if (signal?.cancelled) return;
        const matriculas = matriculasRes.data ?? [];
        const alumnos = alumnosRes.data ?? [];
        const alumnoMap = new Map<number, DTO.AlumnoDTO>();
        for (const alumno of alumnos) {
          if (alumno.id != null) {
            alumnoMap.set(alumno.id, alumno);
          }
        }
        const options = matriculas
          .map((matricula) => {
            const alumno = matricula.alumnoId
              ? alumnoMap.get(matricula.alumnoId)
              : undefined;
            const nombreBase = alumno
              ? `${alumno.apellido ?? ""}, ${alumno.nombre ?? ""}`
                  .trim()
                  .replace(/^,\s*/, "")
              : "";
            const label = nombreBase
              ? `${nombreBase} — Matrícula #${matricula.id}`
              : `Matrícula #${matricula.id}`;
            const seccion = alumno?.seccionActualNombre ?? null;
            return {
              value: matricula.id,
              label,
              seccion,
            };
          })
          .sort((a, b) => a.label.localeCompare(b.label, "es"));
        setMatriculaOptions(options);
      } catch (err) {
        console.error(err);
        if (signal?.cancelled) return;
        setMatriculaOptions([]);
        setMatriculasError("No se pudieron cargar las matrículas disponibles");
      } finally {
        if (signal?.cancelled) return;
        setMatriculasLoading(false);
      }
    },
    [canManageBajas],
  );

  useEffect(() => {
    if (!canManageBajas) {
      setMatriculaOptions([]);
      setMatriculasError(null);
      setMatriculasLoading(false);
      return;
    }

    const signal = { cancelled: false };
    loadMatriculas(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [canManageBajas, loadMatriculas]);

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

  const revisionLabels: Record<DTO.EstadoRevisionAdministrativa, string> = {
    [DTO.EstadoRevisionAdministrativa.PENDIENTE]: "Pendiente",
    [DTO.EstadoRevisionAdministrativa.CONFIRMADA]: "Sin deudas",
    [DTO.EstadoRevisionAdministrativa.DEUDAS_INFORMADAS]: "Deudas informadas",
  };

  const revisionVariant: Record<
    DTO.EstadoRevisionAdministrativa,
    "outline" | "default" | "destructive"
  > = {
    [DTO.EstadoRevisionAdministrativa.PENDIENTE]: "outline",
    [DTO.EstadoRevisionAdministrativa.CONFIRMADA]: "default",
    [DTO.EstadoRevisionAdministrativa.DEUDAS_INFORMADAS]: "destructive",
  };

  const formatDateTime = (value?: string | null) => {
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
      estadoRevisionAdministrativa: sol.estadoRevisionAdministrativa,
      motivo: sol.motivo,
      motivoRechazo: sol.motivoRechazo,
      observacionRevisionAdministrativa: sol.observacionRevisionAdministrativa,
      fechaDecision: sol.fechaDecision,
      fechaRevisionAdministrativa: sol.fechaRevisionAdministrativa,
      matriculaId: sol.matriculaId,
      periodoEscolarId: sol.periodoEscolarId,
      decididoPorPersonaId: sol.decididoPorPersonaId,
      revisadoAdministrativamentePorPersonaId:
        sol.revisadoAdministrativamentePorPersonaId,
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

  const ensurePersonaActual = (message: string) => {
    if (!personaActualId) {
      toast.error(message);
      return false;
    }
    return true;
  };

  const handleApproveSolicitud = async (sol: DTO.SolicitudBajaAlumnoDTO) => {
    if (
      sol.estadoRevisionAdministrativa ===
      DTO.EstadoRevisionAdministrativa.PENDIENTE
    ) {
      toast.error(
        "Administración debe completar la revisión antes de aprobar la baja",
      );
      return;
    }
    if (!ensurePersonaActual("No pudimos identificar a la persona que aprueba la solicitud"))
      return;
    if (!window.confirm("¿Confirmás aceptar la baja del alumno?")) return;

    setProcessingSolicitudId(sol.id);
    try {
      await vidaEscolar.solicitudesBaja.approve(sol.id, {
        decididoPorPersonaId: personaActualId!,
      });
      toast.success("Baja aceptada correctamente");
      await Promise.all([fetchSolicitudesBaja(), fetchHistorialBajas()]);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo aceptar la baja");
    } finally {
      setProcessingSolicitudId(null);
    }
  };

  const handleRejectSolicitud = async (sol: DTO.SolicitudBajaAlumnoDTO) => {
    if (
      sol.estadoRevisionAdministrativa ===
      DTO.EstadoRevisionAdministrativa.PENDIENTE
    ) {
      toast.error(
        "Administración debe completar la revisión antes de rechazar la baja",
      );
      return;
    }
    if (!ensurePersonaActual("No pudimos identificar a la persona que rechaza la solicitud"))
      return;
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
        decididoPorPersonaId: personaActualId!,
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

  const handleAdministracionRevision = async (
    sol: DTO.SolicitudBajaAlumnoDTO,
    estado: DTO.EstadoRevisionAdministrativa,
  ) => {
    if (
      sol.estadoRevisionAdministrativa &&
      sol.estadoRevisionAdministrativa !==
        DTO.EstadoRevisionAdministrativa.PENDIENTE
    ) {
      toast.error("La solicitud ya cuenta con la revisión administrativa");
      return;
    }

    if (!ensurePersonaActual("No pudimos identificar a la persona que revisa la solicitud"))
      return;

    let observacion: string | undefined =
      sol.observacionRevisionAdministrativa?.trim() || undefined;

    if (estado === DTO.EstadoRevisionAdministrativa.DEUDAS_INFORMADAS) {
      const detalle = window.prompt(
        "Detalle de las deudas informadas",
        observacion ?? "",
      );
      if (detalle == null) return;
      const normalized = detalle.trim();
      if (!normalized) {
        toast.error("Debés indicar el detalle de las deudas informadas");
        return;
      }
      observacion = normalized;
    }

    setProcessingRevisionId(sol.id ?? null);
    try {
      await vidaEscolar.solicitudesBaja.review(sol.id, {
        estadoRevisionAdministrativa: estado,
        revisadoPorPersonaId: personaActualId!,
        observacionRevisionAdministrativa: observacion,
      });
      toast.success(
        estado === DTO.EstadoRevisionAdministrativa.CONFIRMADA
          ? "Revisión administrativa confirmada"
          : "Deudas informadas a Dirección",
      );
      await fetchSolicitudesBaja();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo registrar la revisión administrativa");
    } finally {
      setProcessingRevisionId(null);
    }
  };

  const resetCrearBajaForm = useCallback(() => {
    setCrearBajaMotivo("");
    setCrearBajaMatriculaId(null);
    setCrearBajaLoading(false);
  }, []);

  const handleCrearBajaOpenChange = useCallback(
    (open: boolean) => {
      setCrearBajaOpen(open);
      if (open) {
        loadMatriculas();
        return;
      }
      resetCrearBajaForm();
    },
    [loadMatriculas, resetCrearBajaForm],
  );

  const handleCrearBaja = async () => {
    if (crearBajaMatriculaId == null) {
      toast.error("Seleccioná un alumno para generar la baja");
      return;
    }
    const motivo = crearBajaMotivo.trim();
    if (!motivo) {
      toast.error("El motivo de la baja es obligatorio");
      return;
    }

    setCrearBajaLoading(true);
    try {
      await vidaEscolar.solicitudesBaja.create({
        matriculaId: crearBajaMatriculaId,
        motivo,
      });
      toast.success("Solicitud de baja registrada correctamente");
      resetCrearBajaForm();
      setCrearBajaOpen(false);
      await Promise.all([fetchSolicitudesBaja(), fetchHistorialBajas()]);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo registrar la solicitud de baja");
    } finally {
      setCrearBajaLoading(false);
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

    if (selectedTab === "bajas" && !canManageBajas) {
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

  const filteredSolicitudesBaja = useMemo(() => {
    if (estadoSolicitudesFiltro === "all") {
      return solicitudesBaja;
    }
    return solicitudesBaja.filter(
      (solicitud) => solicitud.estado === estadoSolicitudesFiltro,
    );
  }, [estadoSolicitudesFiltro, solicitudesBaja]);

  const selectedMatriculaInfo = useMemo(() => {
    if (!crearBajaMatriculaId) return null;
    const option = matriculaOptions.find(
      (item) => item.value === crearBajaMatriculaId,
    );
    return option ?? null;
  }, [crearBajaMatriculaId, matriculaOptions]);

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
              if (v === "bajas" && !canManageBajas) {
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
              {canManageBajas && <TabsTrigger value="bajas">Bajas</TabsTrigger>}
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
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchSolicitudesBaja}
                      >
                        <TimerReset className="mr-2 h-4 w-4" /> Actualizar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingSolicitudesBaja ? (
                      <LoadingState label="Cargando solicitudes…" />
                    ) : errorSolicitudesBaja ? (
                      <div className="text-sm text-red-600">
                        {errorSolicitudesBaja}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-xs text-muted-foreground">
                            Mostrando {filteredSolicitudesBaja.length} de {" "}
                            {solicitudesBaja.length} solicitudes
                          </div>
                          <Select
                            value={estadoSolicitudesFiltro}
                            onValueChange={(value) =>
                              setEstadoSolicitudesFiltro(
                                value as "all" | DTO.EstadoSolicitudBaja,
                              )
                            }
                          >
                            <SelectTrigger className="w-full sm:w-[220px]">
                              <SelectValue placeholder="Filtrar por estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                Todas ({solicitudesBaja.length})
                              </SelectItem>
                              <SelectItem value={DTO.EstadoSolicitudBaja.PENDIENTE}>
                                Pendientes ({bajasPendientes.length})
                              </SelectItem>
                              <SelectItem value={DTO.EstadoSolicitudBaja.APROBADA}>
                                Aprobadas ({bajasAprobadas.length})
                              </SelectItem>
                              <SelectItem value={DTO.EstadoSolicitudBaja.RECHAZADA}>
                                Rechazadas ({bajasRechazadas.length})
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {solicitudesBaja.length === 0 ? (
                          <div className="py-8 text-center text-sm text-muted-foreground">
                            No hay solicitudes de baja registradas.
                          </div>
                        ) : filteredSolicitudesBaja.length === 0 ? (
                          <div className="py-8 text-center text-sm text-muted-foreground">
                            No hay solicitudes para el filtro seleccionado.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                              <thead>
                                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                                  <th className="py-2 pr-4 font-medium">Alumno</th>
                                  <th className="py-2 pr-4 font-medium">Motivo</th>
                                  <th className="py-2 pr-4 font-medium">Administración</th>
                                  <th className="py-2 pr-4 font-medium">Estado</th>
                                  <th className="py-2 pr-4 font-medium">Decisión</th>
                                  <th className="py-2 pr-4 font-medium">Acciones</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredSolicitudesBaja.map((sol) => {
                                  const estado =
                                    sol.estado ?? DTO.EstadoSolicitudBaja.PENDIENTE;
                                  const revisionEstado =
                                    sol.estadoRevisionAdministrativa ??
                                    DTO.EstadoRevisionAdministrativa.PENDIENTE;
                                  const nombre =
                                    [sol.alumnoApellido, sol.alumnoNombre]
                                      .filter(Boolean)
                                      .join(", ") ||
                                    "Alumno sin datos";
                                  const revisionObservacion =
                                    sol.observacionRevisionAdministrativa?.trim() ||
                                    null;
                                  const puedeRevisar =
                                    canReviewBajasAdministracion &&
                                    estado === DTO.EstadoSolicitudBaja.PENDIENTE &&
                                    revisionEstado ===
                                      DTO.EstadoRevisionAdministrativa.PENDIENTE;
                                  const puedeDecidir =
                                    canDecideBajasDireccion &&
                                    estado === DTO.EstadoSolicitudBaja.PENDIENTE &&
                                    revisionEstado !==
                                      DTO.EstadoRevisionAdministrativa.PENDIENTE;
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
                                        <div className="flex flex-col gap-1 text-sm">
                                          <Badge variant={revisionVariant[revisionEstado]}>
                                            {revisionLabels[revisionEstado]}
                                          </Badge>
                                          <div className="text-xs text-muted-foreground">
                                            {formatDateTime(sol.fechaRevisionAdministrativa)}
                                          </div>
                                          {sol.revisadoAdministrativamentePorPersonaId && (
                                            <div className="text-xs text-muted-foreground">
                                              Rev. por #
                                              {sol.revisadoAdministrativamentePorPersonaId}
                                            </div>
                                          )}
                                          {revisionObservacion && (
                                            <p className="text-xs text-muted-foreground whitespace-pre-line">
                                              {revisionObservacion}
                                            </p>
                                          )}
                                        </div>
                                      </td>
                                      <td className="py-3 pr-4">
                                        <Badge variant={estadoVariant[estado]}>
                                          {estadoLabels[estado]}
                                        </Badge>
                                      </td>
                                      <td className="py-3 pr-4 text-sm text-muted-foreground">
                                        <div>{formatDateTime(sol.fechaDecision)}</div>
                                        {sol.decididoPorPersonaId && (
                                          <div className="text-xs">
                                            Decidido por #{sol.decididoPorPersonaId}
                                          </div>
                                        )}
                                      </td>
                                      <td className="py-3 pr-4">
                                        <div className="flex flex-wrap gap-2">
                                          {puedeRevisar && (
                                            <>
                                              <Button
                                                size="sm"
                                                onClick={() =>
                                                  handleAdministracionRevision(
                                                    sol,
                                                    DTO.EstadoRevisionAdministrativa.CONFIRMADA,
                                                  )
                                                }
                                                disabled={
                                                  processingRevisionId === sol.id
                                                }
                                              >
                                                Confirmar baja
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() =>
                                                  handleAdministracionRevision(
                                                    sol,
                                                    DTO.EstadoRevisionAdministrativa.DEUDAS_INFORMADAS,
                                                  )
                                                }
                                                disabled={
                                                  processingRevisionId === sol.id
                                                }
                                              >
                                                Informar deudas
                                              </Button>
                                            </>
                                          )}
                                          {puedeDecidir && (
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
                                                Aceptar baja
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
                                            onClick={() =>
                                              handleDownloadSolicitud(sol)
                                            }
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
                                    {formatDateTime(sol.fechaDecision)}
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
        {canManageBajas && (
          <Dialog open={crearBajaOpen} onOpenChange={handleCrearBajaOpenChange}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Registrar nueva baja</DialogTitle>
                <DialogDescription>
                  Creá una solicitud manual para dar de baja a un alumno.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="crear-baja-alumno">Alumno</Label>
                  {matriculasLoading ? (
                    <LoadingState label="Cargando matrículas disponibles…" />
                  ) : matriculasError ? (
                    <div className="space-y-2">
                      <p className="text-sm text-destructive">{matriculasError}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadMatriculas()}
                      >
                        Reintentar
                      </Button>
                    </div>
                  ) : matriculaOptions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No hay matrículas activas disponibles para registrar una baja manual.
                    </p>
                  ) : (
                    <Select
                      value={
                        crearBajaMatriculaId != null
                          ? String(crearBajaMatriculaId)
                          : undefined
                      }
                      onValueChange={(value) =>
                        setCrearBajaMatriculaId(Number(value))
                      }
                      disabled={crearBajaLoading}
                    >
                      <SelectTrigger id="crear-baja-alumno">
                        <SelectValue placeholder="Seleccioná un alumno" />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        {matriculaOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={String(option.value)}
                          >
                            <div className="flex flex-col">
                              <span>{option.label}</span>
                              {option.seccion && (
                                <span className="text-xs text-muted-foreground">
                                  {option.seccion}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {selectedMatriculaInfo && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">#{crearBajaMatriculaId}</Badge>
                      {selectedMatriculaInfo.seccion && (
                        <span>{selectedMatriculaInfo.seccion}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="crear-baja-motivo">Motivo</Label>
                  <Textarea
                    id="crear-baja-motivo"
                    placeholder="Ingresá el motivo de la baja"
                    value={crearBajaMotivo}
                    onChange={(event) => setCrearBajaMotivo(event.target.value)}
                    rows={4}
                    disabled={crearBajaLoading}
                  />
                </div>
              </div>
              <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => handleCrearBajaOpenChange(false)}
                  disabled={crearBajaLoading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCrearBaja}
                  disabled={
                    crearBajaLoading ||
                    matriculasLoading ||
                    matriculaOptions.length === 0
                  }
                >
                  {crearBajaLoading ? "Registrando…" : "Registrar baja"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

  );
}
