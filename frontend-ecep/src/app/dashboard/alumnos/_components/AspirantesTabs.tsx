"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import LoadingState from "@/components/common/LoadingState";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, CircleCheck, Clock, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import * as DTO from "@/types/api-generated";
import { admisiones, gestionAcademica, identidad } from "@/services/api/modules";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod";
import { logger } from "@/lib/logger";
import {
  formatTurnoLabel as formatTurnoLabelLib,
  normalizeTurnoKey,
} from "@/lib/turno-label";

const aspirantesLogger = logger.child({ module: "dashboard-aspirantes-tabs" });

const logAspirantesError = (error: unknown, message?: string) => {
  if (message) {
    aspirantesLogger.error({ err: error }, message);
  } else {
    aspirantesLogger.error({ err: error });
  }
};

const ESTADOS = {
  PENDIENTE: "PENDIENTE",
  PROPUESTA: "PROPUESTA_ENVIADA",
  PROGRAMADA: "ENTREVISTA_PROGRAMADA",
  ENTREVISTA_REALIZADA: "ENTREVISTA_REALIZADA",
  ACEPTADA: "ACEPTADA",
  RECHAZADA: "RECHAZADA",
} as const;

const ESTADO_FILTER_ALL = "ALL";

const ESTADO_FILTER_OPTIONS = [
  { value: ESTADO_FILTER_ALL, label: "Todos los estados" },
  { value: ESTADOS.PENDIENTE, label: "Pendientes" },
  { value: ESTADOS.PROPUESTA, label: "Propuestas enviadas" },
  { value: ESTADOS.PROGRAMADA, label: "Entrevistas programadas" },
  { value: ESTADOS.ENTREVISTA_REALIZADA, label: "Entrevistas realizadas" },
  { value: ESTADOS.ACEPTADA, label: "Aceptadas" },
  { value: ESTADOS.RECHAZADA, label: "Rechazadas" },
] as const;

const formatCurso = (curso?: DTO.Curso | string | null) => {
  if (!curso && curso !== 0) return "—";
  const base: Record<string, string> = {
    SALA_4: "Sala 4",
    SALA_5: "Sala 5",
    PRIMERO: "1° Grado",
    SEGUNDO: "2° Grado",
    TERCERO: "3° Grado",
    CUARTO: "4° Grado",
    QUINTO: "5° Grado",
    SEXTO: "6° Grado",
  };
  return base[String(curso)] ?? String(curso);
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const normalizeEstado = (estado?: string | null) =>
  String(estado ?? "").trim().toUpperCase();

const estadoBadge = (estado?: string | null) => {
  const e = normalizeEstado(estado);
  if (e === ESTADOS.PENDIENTE) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="h-3 w-3" /> Pendiente
      </Badge>
    );
  }
  if (e === ESTADOS.PROPUESTA || e === ESTADOS.PROGRAMADA) {
    return (
      <Badge variant="outline" className="gap-1">
        <Calendar className="h-3 w-3" /> Entrevista
      </Badge>
    );
  }
  if (e === ESTADOS.ENTREVISTA_REALIZADA || e === ESTADOS.ACEPTADA) {
    return (
      <Badge variant="default" className="gap-1">
        <CircleCheck className="h-3 w-3" /> {e === ESTADOS.ACEPTADA ? "Aceptada" : "Entrevista"}
      </Badge>
    );
  }
  if (e === ESTADOS.RECHAZADA) {
    return (
      <Badge variant="destructive" className="gap-1">
        <X className="h-3 w-3" /> Rechazada
      </Badge>
    );
  }
  return <Badge variant="secondary">{estado?.trim() || "—"}</Badge>;
};

const availabilityLabel = (solicitud: DTO.SolicitudAdmisionDTO) => {
  if (solicitud.disponibilidadCurso) return solicitud.disponibilidadCurso;
  if (solicitud.cupoDisponible == null) return "Pendiente";
  return solicitud.cupoDisponible ? "Disponible" : "Sin cupo";
};

type Props = {
  searchTerm: string;
};

type SolicitudAspirante = DTO.AspiranteDTO & {
  nombre?: string | null;
  apellido?: string | null;
  emailContacto?: string | null;
  email?: string | null;
  telefono?: string | null;
};

type SolicitudAdmisionItem = DTO.SolicitudAdmisionDTO & {
  aspirante?: SolicitudAspirante;
  aspirantePersona?: DTO.PersonaDTO | null;
  matriculaId?: number | null;
  alumnoId?: number | null;
  altaGenerada?: boolean | null;
};

const resolveAspiranteNombre = (solicitud: SolicitudAdmisionItem) => {
  const aspirante = solicitud.aspirante;
  const persona = solicitud.aspirantePersona;
  const nombre = aspirante?.nombre ?? persona?.nombre ?? "";
  const apellido = aspirante?.apellido ?? persona?.apellido ?? "";
  const fullName = `${nombre} ${apellido}`.trim();
  if (fullName) return fullName;
  if (persona?.dni) return `Aspirante DNI ${persona.dni}`;
  return `Solicitud #${solicitud.id}`;
};

const resolveAspiranteEmail = (solicitud: SolicitudAdmisionItem) => {
  const aspirante = solicitud.aspirante;
  const persona = solicitud.aspirantePersona;
  return aspirante?.emailContacto ?? aspirante?.email ?? persona?.email ?? "—";
};

const resolveAspiranteTelefono = (solicitud: SolicitudAdmisionItem) => {
  const aspirante = solicitud.aspirante;
  const persona = solicitud.aspirantePersona;
  return (
    aspirante?.telefono ??
    persona?.celular ??
    persona?.telefono ??
    "—"
  );
};

const resolveAltaGenerada = (solicitud: Partial<SolicitudAdmisionItem>) => {
  const candidate = solicitud as Record<string, unknown> | undefined;
  if (!candidate) return false;
  const altaFlag = candidate.altaGenerada as boolean | null | undefined;
  if (altaFlag != null) {
    return Boolean(altaFlag);
  }
  const alumnoId = candidate.alumnoId as number | null | undefined;
  const matriculaId = candidate.matriculaId as number | null | undefined;
  if (alumnoId != null || matriculaId != null) {
    return Boolean(alumnoId ?? matriculaId);
  }
  const flags = [(candidate as any)?.tieneAltaGenerada, (candidate as any)?.altaRegistrada];
  return flags.some((value) => Boolean(value));
};

const puedeDarDeAltaSolicitud = (solicitud: SolicitudAdmisionItem) => {
  if (resolveAltaGenerada(solicitud)) {
    return false;
  }
  const estadoActual = normalizeEstado(solicitud.estado);
  if (estadoActual === ESTADOS.RECHAZADA) {
    return false;
  }
  return (
    Boolean(solicitud.entrevistaRealizada) ||
    estadoActual === ESTADOS.ENTREVISTA_REALIZADA ||
    estadoActual === ESTADOS.ACEPTADA
  );
};

function useSolicitudesAdmision(query: string) {
  const [data, setData] = useState<SolicitudAdmisionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await admisiones.solicitudesAdmision.list();
      const solicitudes = res.data ?? [];

      const personaIds = Array.from(
        new Set(
          solicitudes
            .map((item) => item.aspirante?.personaId)
            .filter((id): id is number => typeof id === "number"),
        ),
      );

      let personaById = new Map<number, DTO.PersonaDTO>();
      if (personaIds.length > 0) {
        try {
          const personasRes = await identidad.personasCore.getManyById(personaIds);
          const personas = personasRes.data ?? [];
          personaById = new Map(personas.map((persona) => [persona.id, persona]));
        } catch (personaErr) {
          logAspirantesError(
            personaErr,
            "No se pudieron cargar los datos de las personas asociadas a las solicitudes",
          );
        }
      }

      const enriched: SolicitudAdmisionItem[] = solicitudes.map((item) => {
        const altaGenerada = resolveAltaGenerada(item);
        return {
          ...item,
          aspirantePersona:
            item.aspirante?.personaId != null
              ? personaById.get(item.aspirante.personaId) ?? null
              : null,
          altaGenerada,
          matriculaId: item.matriculaId ?? null,
          alumnoId: item.alumnoId ?? null,
        };
      });

      setData(enriched);
    } catch (e) {
      setError(e);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      await fetchAll();
      if (!alive) return;
    })();
    return () => {
      alive = false;
    };
  }, [fetchAll]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((item) => {
      const aspirante = item.aspirante;
      const persona = item.aspirantePersona;
      const nombre = resolveAspiranteNombre(item).toLowerCase();
      const curso = formatCurso(aspirante?.cursoSolicitado).toLowerCase();
      const estado = String(item.estado ?? "").toLowerCase();
      const dni = persona?.dni?.toLowerCase() ?? "";
      return (
        nombre.includes(q) ||
        curso.includes(q) ||
        estado.includes(q) ||
        dni.includes(q)
      );
    });
  }, [data, query]);

  return { data: filtered, loading, error, refetch: fetchAll };
}

export default function AspirantesTab({ searchTerm }: Props) {
  const {
    data: solicitudes,
    loading,
    error,
    refetch,
  } = useSolicitudesAdmision(searchTerm);

  const [altaOpen, setAltaOpen] = useState(false);
  const [altaSolicitud, setAltaSolicitud] = useState<SolicitudAdmisionItem | null>(null);
  const [page, setPage] = useState(0);
  const [estadoFilter, setEstadoFilter] = useState<string>(ESTADO_FILTER_ALL);
  const [altasRegistradas, setAltasRegistradas] = useState<Set<number>>(new Set());
  const pageSize = 6;

  useEffect(() => {
    setPage(0);
  }, [searchTerm, estadoFilter]);

  useEffect(() => {
    setAltasRegistradas((prev) => {
      const next = new Set(prev);
      solicitudes.forEach((item) => {
        if (item.id != null && resolveAltaGenerada(item)) {
          next.add(item.id);
        }
      });
      return next;
    });
  }, [solicitudes]);

  const filteredSolicitudes = useMemo(() => {
    if (estadoFilter === ESTADO_FILTER_ALL) {
      return solicitudes;
    }
    return solicitudes.filter(
      (item) => normalizeEstado(item.estado) === estadoFilter,
    );
  }, [estadoFilter, solicitudes]);

  const filteredLength = filteredSolicitudes.length;

  useEffect(() => {
    if (page * pageSize >= filteredLength && page > 0) {
      const nextPage = Math.max(0, Math.ceil(filteredLength / pageSize) - 1);
      setPage(nextPage);
    }
  }, [page, filteredLength, pageSize]);

  const totalPages = Math.ceil(filteredLength / pageSize);
  const startIndex = totalPages === 0 ? 0 : page * pageSize;
  const endIndex = Math.min(filteredLength, startIndex + pageSize);
  const currentSolicitudes = filteredSolicitudes.slice(startIndex, endIndex);

  const openAlta = (row: SolicitudAdmisionItem) => {
    if (resolveAltaGenerada(row)) {
      toast.error("La solicitud ya fue dada de alta anteriormente.");
      return;
    }
    setAltaSolicitud(row);
    setAltaOpen(true);
  };
  useEffect(() => {
    if (!altaOpen || !altaSolicitud) return;
    const next = solicitudes.find((item) => item.id === altaSolicitud.id);
    if (next && next !== altaSolicitud) {
      setAltaSolicitud(next);
    }
  }, [altaOpen, altaSolicitud, solicitudes]);

  if (loading) {
    return <LoadingState label="Cargando solicitudes…" />;
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 py-8">
        No se pudieron cargar las solicitudes.
        <Button variant="link" onClick={refetch} className="ml-2 p-0 h-auto">
          Reintentar
        </Button>
      </div>
    );
  }

  if (!solicitudes.length) {
    return (
      <div className="text-sm text-muted-foreground py-8">
        No hay solicitudes de admisión registradas.
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Aspirantes</CardTitle>
          <CardDescription>
            Gestioná las solicitudes recibidas: entrevistas, disponibilidad y decisiones finales.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-2">
              <Label htmlFor="estado-filter">Filtrar por estado</Label>
              <Select
                value={estadoFilter}
                onValueChange={setEstadoFilter}
              >
                <SelectTrigger id="estado-filter" className="w-full md:w-[220px]">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADO_FILTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {currentSolicitudes.map((row) => {
              const nombre = resolveAspiranteNombre(row);
              const cantidadPropuestas = row.cantidadPropuestasEnviadas ?? 0;
              const altaGenerada =
                (row.id != null && altasRegistradas.has(row.id)) ||
                resolveAltaGenerada(row);
              const puedeDarDeAlta = !altaGenerada && puedeDarDeAltaSolicitud(row);
              return (
                <Card key={row.id} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base font-semibold">
                          {nombre || "—"}
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          Solicitud #{row.id} · {formatDate(row.fechaSolicitud)}
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {estadoBadge(row.estado)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">Curso</span>
                      <span>{formatCurso(row.aspirante?.cursoSolicitado)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">Disponibilidad</span>
                      <span>{availabilityLabel(row)}</span>
                    </div>
                    {cantidadPropuestas > 1 && (
                      <div className="text-xs text-muted-foreground">
                        {cantidadPropuestas} propuestas enviadas
                      </div>
                    )}
                    {row.reprogramacionSolicitada && (
                      <div className="text-xs text-muted-foreground">Reprogramación solicitada</div>
                    )}
                  </CardContent>
                  <div className="flex justify-end gap-2 border-t px-6 py-4">
                    {puedeDarDeAlta && (
                      <Button
                        size="sm"
                        onClick={() => openAlta(row)}
                        variant="default"
                      >
                        Dar de alta
                      </Button>
                    )}
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/alumnos/solicitudes/${row.id}`} prefetch={false}>
                        Ver detalle
                      </Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
            {!currentSolicitudes.length && (
              <div className="col-span-full text-sm text-muted-foreground">
                No hay solicitudes que coincidan con los criterios actuales.
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 border-t pt-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <div>
              Mostrando {filteredLength === 0 ? 0 : startIndex + 1}-{endIndex} de {filteredLength} solicitud
              {filteredLength === 1 ? "" : "es"}.
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Anterior
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
                disabled={totalPages === 0 || page >= totalPages - 1}
              >
                Siguiente <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {altaSolicitud && (
        <AltaModal
          open={altaOpen}
          solicitud={altaSolicitud}
          onOpenChange={(open) => {
            setAltaOpen(open);
            if (!open) {
              setAltaSolicitud(null);
            }
          }}
          onSuccess={() => {
            const solicitudId = altaSolicitud?.id;
            if (solicitudId != null) {
              setAltasRegistradas((prev) => {
                const next = new Set(prev);
                next.add(solicitudId);
                return next;
              });
            }
            refetch();
            setAltaSolicitud(null);
          }}
        />
      )}
    </>
  );
}

type AltaModalProps = {
  open: boolean;
  solicitud: SolicitudAdmisionItem;
  onOpenChange: (open: boolean) => void;
  onSuccess: (result: DTO.SolicitudAdmisionAltaResultDTO | null) => void;
  defaultPeriodoId?: number | null;
};

const getPeriodoOrderValue = (periodo?: DTO.PeriodoEscolarDTO | null) => {
  if (!periodo) return 0;
  if (typeof periodo.anio === "number") return periodo.anio;
  if (periodo.fechaInicio) {
    const year = Number(String(periodo.fechaInicio).slice(0, 4));
    if (!Number.isNaN(year)) return year;
  }
  if (periodo.fechaFin) {
    const year = Number(String(periodo.fechaFin).slice(0, 4));
    if (!Number.isNaN(year)) return year;
  }
  return typeof periodo.id === "number" ? periodo.id : 0;
};

function AltaModal({
  open,
  solicitud,
  onOpenChange,
  onSuccess,
  defaultPeriodoId,
}: AltaModalProps) {
  const [secciones, setSecciones] = useState<DTO.SeccionDTO[]>([]);
  const [seccionesLoading, setSeccionesLoading] = useState(false);
  const [seccionesError, setSeccionesError] = useState<string | null>(null);
  const [selectedSeccionId, setSelectedSeccionId] = useState<string>("");
  const [selectedPeriodoValue, setSelectedPeriodoValue] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const aspiranteNombre = resolveAspiranteNombre(solicitud);
  const turnoPreferido = solicitud.aspirante?.turnoPreferido ?? null;
  const { periodos, periodoEscolarId: activePeriodoId, getPeriodoNombre } = useActivePeriod({
    tickMidnight: false,
  });

  const periodOptions = useMemo(
    () =>
      (periodos ?? [])
        .map((periodo) => {
          if (periodo.id == null) return null;
          return {
            value: String(periodo.id),
            label: getPeriodoNombre(periodo.id, periodo) ?? `Período #${periodo.id}`,
            order: getPeriodoOrderValue(periodo),
          };
        })
        .filter((opt): opt is { value: string; label: string; order: number } => Boolean(opt)),
    [periodos, getPeriodoNombre],
  );

  useEffect(() => {
    if (!open) {
      setSecciones([]);
      setSeccionesError(null);
      setSelectedSeccionId("");
      setSelectedPeriodoValue("");
      return;
    }

    const initialTurno = turnoPreferido ? String(turnoPreferido) : "";
    const initialTurnoKey = initialTurno
      ? normalizeTurnoKey(initialTurno)
      : "";
    setSelectedSeccionId("");
    setSeccionesLoading(true);
    setSeccionesError(null);

    (async () => {
      try {
        const res = await gestionAcademica.secciones.list();
        const data = res.data ?? [];
        setSecciones(data);
        let preselectedSeccion: string | null = null;
        if (initialTurnoKey) {
          const matching = data.find(
            (sec) =>
              normalizeTurnoKey(String(sec.turno ?? "")) === initialTurnoKey,
          );
          if (matching?.id != null) {
            preselectedSeccion = String(matching.id);
          }
        }
        if (!preselectedSeccion && data.length === 1 && data[0].id != null) {
          preselectedSeccion = String(data[0].id);
        }
        if (preselectedSeccion) {
          setSelectedSeccionId(preselectedSeccion);
        }
      } catch (error: any) {
        setSeccionesError(
          error?.message ?? "No se pudieron obtener las secciones disponibles",
        );
      } finally {
        setSeccionesLoading(false);
      }
    })();
  }, [open, solicitud.id, turnoPreferido]);

  useEffect(() => {
    if (!open) return;
    if (defaultPeriodoId) {
      setSelectedPeriodoValue(String(defaultPeriodoId));
      return;
    }
    if (activePeriodoId) {
      setSelectedPeriodoValue(String(activePeriodoId));
      return;
    }
    const firstOption = periodOptions[0];
    if (firstOption) {
      setSelectedPeriodoValue(firstOption.value);
    }
  }, [open, defaultPeriodoId, activePeriodoId, periodOptions]);

  useEffect(() => {
    if (!open) return;
    if (!selectedPeriodoValue) {
      setSelectedSeccionId("");
      return;
    }
    const matching = secciones.filter(
      (sec) => String(sec.periodoEscolarId ?? "") === selectedPeriodoValue,
    );
    if (matching.length === 1 && matching[0].id != null) {
      setSelectedSeccionId(String(matching[0].id));
      return;
    }
    if (
      selectedSeccionId &&
      !matching.some((sec) => String(sec.id) === selectedSeccionId)
    ) {
      setSelectedSeccionId("");
    }
  }, [open, selectedPeriodoValue, secciones, selectedSeccionId]);

  const formatTurnoLabel = (value?: string | null) =>
    formatTurnoLabelLib(value) ?? "";

  const formatSeccionLabel = (seccion: DTO.SeccionDTO) => {
    const parts = [seccion.nivel, seccion.gradoSala, seccion.division]
      .map((part) => (part ?? "").toString().trim())
      .filter(Boolean);
    const base = parts.join(" ");
    const turnoLabel = formatTurnoLabel(seccion.turno);
    if (turnoLabel) {
      return `${base || "Sección"} (${turnoLabel})`;
    }
    return base || `Sección #${seccion.id}`;
  };

  const filteredSecciones = useMemo(() => {
    if (!selectedPeriodoValue) {
      return secciones;
    }
    return secciones.filter(
      (sec) => String(sec.periodoEscolarId ?? "") === selectedPeriodoValue,
    );
  }, [secciones, selectedPeriodoValue]);

  const handlePeriodoChange = (value: string) => {
    setSelectedPeriodoValue(value);
  };

  const handleSubmit = async () => {
    if (!selectedPeriodoValue) {
      toast.error("Seleccioná el período lectivo para el alta");
      return;
    }

    if (!selectedSeccionId) {
      toast.error("Seleccioná una sección para el alta");
      return;
    }
    setSaving(true);
    try {
      const res = await admisiones.solicitudesAdmision.alta(solicitud.id, {
        seccionId: Number(selectedSeccionId),
        periodoEscolarId: Number(selectedPeriodoValue),
        autoAsignarSiguientePeriodo: false,
      });
      toast.success("Alumno dado de alta correctamente");
      onSuccess(res.data ?? null);
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message ?? "No se pudo completar el alta");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Dar de alta — {aspiranteNombre}</DialogTitle>
          <DialogDescription>
            Migrá la solicitud a un alumno matriculado. Seleccioná la sección destino antes de confirmar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
            <p>
              Curso solicitado: {formatCurso(solicitud.aspirante?.cursoSolicitado)}
            </p>
            <p>
              Disponibilidad informada: {availabilityLabel(solicitud)}
            </p>
            {turnoPreferido && (
              <p>
                Turno preferido registrado: {formatTurnoLabel(turnoPreferido)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Período lectivo</Label>
            <Select
              value={selectedPeriodoValue}
              onValueChange={handlePeriodoChange}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná el período" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!periodOptions.length && (
              <p className="text-xs text-muted-foreground">
                Todavía no hay períodos creados en el calendario escolar.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Sección destino</Label>
            <Select
              value={selectedSeccionId}
              onValueChange={setSelectedSeccionId}
              disabled={seccionesLoading || !filteredSecciones.length}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná la sección" />
              </SelectTrigger>
              <SelectContent>
                {filteredSecciones.map((sec) => (
                  <SelectItem key={sec.id} value={String(sec.id)}>
                    {formatSeccionLabel(sec)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {seccionesLoading && (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Cargando secciones…
              </p>
            )}
            {seccionesError && (
              <p className="text-xs text-destructive">{seccionesError}</p>
            )}
            {!seccionesLoading && !filteredSecciones.length && !seccionesError && (
              <p className="text-xs text-muted-foreground">
                No hay secciones disponibles para el período seleccionado.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Recordá verificar que la sección corresponda al período lectivo elegido.
            </p>
          </div>
        </div>

        <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              saving ||
              !selectedPeriodoValue ||
              !selectedSeccionId
            }
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirmar alta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { AltaModal };
