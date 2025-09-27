"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LoadingState from "@/components/common/LoadingState";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  CalendarDays,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText,
  Mail,
  Phone,
  RefreshCw,
  StickyNote,
  X,
  Loader2,
} from "lucide-react";
import type * as DTO from "@/types/api-generated";
import { admisiones, gestionAcademica, identidad } from "@/services/api/modules";

const ESTADOS = {
  PENDIENTE: "PENDIENTE",
  PROPUESTA: "PROPUESTA_ENVIADA",
  PROGRAMADA: "ENTREVISTA_PROGRAMADA",
  ENTREVISTA_REALIZADA: "ENTREVISTA_REALIZADA",
  ACEPTADA: "ACEPTADA",
  RECHAZADA: "RECHAZADA",
} as const;

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
        <CheckCircle className="h-3 w-3" /> {e === ESTADOS.ACEPTADA ? "Aceptada" : "Entrevista"}
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

const puedeDarDeAltaSolicitud = (solicitud: SolicitudAdmisionItem) => {
  const estadoActual = normalizeEstado(solicitud.estado);
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
          // eslint-disable-next-line no-console
          console.error(
            "No se pudieron cargar los datos de las personas asociadas a las solicitudes",
            personaErr,
          );
        }
      }

      const enriched: SolicitudAdmisionItem[] = solicitudes.map((item) => ({
        ...item,
        aspirantePersona:
          item.aspirante?.personaId != null
            ? personaById.get(item.aspirante.personaId) ?? null
            : null,
      }));

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

  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<SolicitudAdmisionItem | null>(null);
  const [promptInterviewOpen, setPromptInterviewOpen] = useState(false);
  const [altaOpen, setAltaOpen] = useState(false);
  const [altaSolicitud, setAltaSolicitud] = useState<SolicitudAdmisionItem | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 6;

  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  useEffect(() => {
    if (page * pageSize >= solicitudes.length && page > 0) {
      const nextPage = Math.max(0, Math.ceil(solicitudes.length / pageSize) - 1);
      setPage(nextPage);
    }
  }, [page, solicitudes.length, pageSize]);

  const totalPages = Math.ceil(solicitudes.length / pageSize);
  const startIndex = totalPages === 0 ? 0 : page * pageSize;
  const endIndex = Math.min(solicitudes.length, startIndex + pageSize);
  const currentSolicitudes = solicitudes.slice(startIndex, endIndex);

  const openDetail = (row: SolicitudAdmisionItem) => {
    setSelected(row);
    setDetailOpen(true);
  };

  const openAlta = (row: SolicitudAdmisionItem) => {
    setAltaSolicitud(row);
    setAltaOpen(true);
  };

  useEffect(() => {
    if (!detailOpen || !selected) {
      setPromptInterviewOpen(false);
      return;
    }
    const estado = normalizeEstado(selected.estado);
    if (
      estado === ESTADOS.PROGRAMADA &&
      selected.fechaEntrevistaConfirmada &&
      !selected.entrevistaRealizada
    ) {
      const fecha = new Date(selected.fechaEntrevistaConfirmada);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      fecha.setHours(0, 0, 0, 0);
      if (fecha <= hoy) {
        setPromptInterviewOpen(true);
      }
    }
  }, [detailOpen, selected]);

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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {currentSolicitudes.map((row) => {
              const nombre = resolveAspiranteNombre(row);
              const opciones = row.fechasPropuestas ?? [];
              const cantidadPropuestas = row.cantidadPropuestasEnviadas ?? 0;
              const puedeDarDeAlta = puedeDarDeAltaSolicitud(row);
              return (
                <Card key={row.id} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base font-semibold">
                          {nombre || "—"}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-xs">
                          <CalendarDays className="h-3 w-3" />
                          Solicitada el {formatDate(row.fechaSolicitud)}
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {estadoBadge(row.estado)}
                        {cantidadPropuestas > 1 && (
                          <Badge variant="secondary">{cantidadPropuestas}ª propuesta</Badge>
                        )}
                        {row.reprogramacionSolicitada && (
                          <Badge variant="outline" className="gap-1 border-dashed">
                            <RefreshCw className="h-3 w-3" /> Reprogramación
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-3 text-sm text-muted-foreground">
                    <div>
                      <span className="font-semibold text-foreground">Curso:</span> {formatCurso(row.aspirante?.cursoSolicitado)}
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">Disponibilidad:</span> {availabilityLabel(row)}
                    </div>
                    {opciones.length > 0 && (
                      <div className="text-xs">
                        <span className="font-semibold text-foreground">Últimas propuestas:</span>
                        <ul className="mt-1 space-y-1">
                          {opciones.slice(0, 2).map((fecha, idx) => {
                            const horario = row.rangosHorariosPropuestos?.[idx];
                            return (
                              <li key={`${row.id}-${fecha}-${idx}`}>
                                {formatDate(fecha)}
                                {horario ? ` · ${horario}` : ""}
                              </li>
                            );
                          })}
                          {opciones.length > 2 && <li>…</li>}
                        </ul>
                      </div>
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
                    <Button size="sm" variant="outline" onClick={() => openDetail(row)}>
                      Gestionar
                    </Button>
                  </div>
                </Card>
              );
            })}
            {!currentSolicitudes.length && (
              <div className="col-span-full text-sm text-muted-foreground">
                No hay solicitudes para esta página.
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 border-t pt-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <div>
              Mostrando {solicitudes.length === 0 ? 0 : startIndex + 1}-{endIndex} de {solicitudes.length} solicitud
              {solicitudes.length === 1 ? "" : "es"}.
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

      {selected && (
        <SolicitudDetailDialog
          open={detailOpen}
          onOpenChange={(open) => {
            setDetailOpen(open);
            if (!open) {
              setSelected(null);
              refetch();
            }
          }}
          solicitud={selected}
          onUpdated={refetch}
          onAlta={openAlta}
          promptInterviewOpen={promptInterviewOpen}
          setPromptInterviewOpen={setPromptInterviewOpen}
        />
      )}
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
            refetch();
            setAltaSolicitud(null);
          }}
        />
      )}
    </>
  );
}

type DetailProps = {
  open: boolean;
  solicitud: SolicitudAdmisionItem;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
  onAlta: (solicitud: SolicitudAdmisionItem) => void;
  promptInterviewOpen: boolean;
  setPromptInterviewOpen: (open: boolean) => void;
};

type AltaModalProps = {
  open: boolean;
  solicitud: SolicitudAdmisionItem;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

function SolicitudDetailDialog({
  open,
  solicitud,
  onOpenChange,
  onUpdated,
  onAlta,
  promptInterviewOpen,
  setPromptInterviewOpen,
}: DetailProps) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [confirmDateOpen, setConfirmDateOpen] = useState(false);
  const [decisionOpen, setDecisionOpen] = useState<"aceptar" | "rechazar" | null>(null);
  const [loading, setLoading] = useState(false);
  const [comentariosEntrevista, setComentariosEntrevista] = useState(
    solicitud.comentariosEntrevista ?? "",
  );

  const estado = normalizeEstado(solicitud.estado);
  const propuestas = solicitud.fechasPropuestas ?? [];
  const fechaConfirmada = solicitud.fechaEntrevistaConfirmada;
  const aspiranteNombre = resolveAspiranteNombre(solicitud);
  const aspiranteEmail = resolveAspiranteEmail(solicitud);
  const aspiranteTelefono = resolveAspiranteTelefono(solicitud);
  const aspiranteDni = solicitud.aspirantePersona?.dni ?? null;
  const propuestasDetalladas = propuestas.map((fecha, index) => ({
    fecha,
    horario: solicitud.rangosHorariosPropuestos?.[index] ?? "",
  }));
  const cantidadPropuestas = solicitud.cantidadPropuestasEnviadas ?? 0;
  const puedeMostrarComentariosEntrevista = Boolean(fechaConfirmada);

  const reset = () => {
    setRejectOpen(false);
    setScheduleOpen(false);
    setConfirmDateOpen(false);
    setDecisionOpen(null);
    setPromptInterviewOpen(false);
  };

  useEffect(() => {
    if (open) {
      setComentariosEntrevista(solicitud.comentariosEntrevista ?? "");
    }
  }, [open, solicitud]);

  const handleRechazo = async (motivo: string) => {
    if (!motivo.trim()) {
      toast.error("Indicá un motivo para rechazar");
      return;
    }
    try {
      setLoading(true);
      await admisiones.solicitudesAdmision.rechazar(solicitud.id, { motivo });
      toast.success("Solicitud rechazada");
      onUpdated();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message ?? "No se pudo rechazar");
    } finally {
      setLoading(false);
      reset();
    }
  };

  const handleProgramar = async (form: ScheduleFormState) => {
    const fechas: string[] = [];
    const horarios: string[] = [];
    form.fechas.forEach((fecha, idx) => {
      const value = fecha?.trim();
      if (value) {
        fechas.push(value);
        horarios.push(form.horarios[idx]?.trim() ?? "");
      }
    });

    if (!fechas.length) {
      toast.error("Ingresá al menos una fecha propuesta");
      return;
    }
    if (horarios.some((horario) => !horario)) {
      toast.error("Completá el rango horario para cada fecha propuesta");
      return;
    }
    try {
      setLoading(true);
      await admisiones.solicitudesAdmision.programar(solicitud.id, {
        fechasPropuestas: fechas,
        documentosRequeridos: form.documentos || undefined,
        adjuntosInformativos: form.adjuntos.length ? form.adjuntos : undefined,
        cupoDisponible:
          form.cupoDisponible === null ? undefined : form.cupoDisponible,
        disponibilidadCurso: form.disponibilidad.trim() || undefined,
        rangosHorarios: horarios,
        aclaracionesDireccion: form.aclaraciones.trim() || undefined,
      });
      toast.success("Se envió la propuesta de entrevista");
      onUpdated();
      onOpenChange(false);
      reset();
    } catch (error: any) {
      toast.error(error?.message ?? "No se pudo programar la entrevista");
    } finally {
      setLoading(false);
      setScheduleOpen(false);
    }
  };

  const handleConfirmarFecha = async (fecha: string) => {
    try {
      setLoading(true);
      await admisiones.solicitudesAdmision.confirmarFecha(solicitud.id, {
        fechaSeleccionada: fecha,
      });
      toast.success("Fecha de entrevista confirmada");
      onUpdated();
      onOpenChange(false);
      reset();
    } catch (error: any) {
      toast.error(error?.message ?? "No se pudo registrar la fecha");
    } finally {
      setLoading(false);
      setConfirmDateOpen(false);
    }
  };

  const handleResultadoEntrevista = async (realizada: boolean) => {
    try {
      setLoading(true);
      await admisiones.solicitudesAdmision.registrarEntrevista(solicitud.id, {
        realizada,
        comentarios: comentariosEntrevista.trim() || undefined,
      });
      toast.success(
        realizada
          ? "Entrevista marcada como realizada"
          : "Se habilitó la reprogramación",
      );
      onUpdated();
      if (!realizada) {
        setScheduleOpen(true);
      } else {
        reset();
      }
    } catch (error: any) {
      toast.error(error?.message ?? "No se pudo actualizar la entrevista");
    } finally {
      setLoading(false);
      setPromptInterviewOpen(false);
    }
  };

  const handleGuardarComentarios = async () => {
    try {
      setLoading(true);
      await admisiones.solicitudesAdmision.registrarEntrevista(solicitud.id, {
        comentarios: comentariosEntrevista.trim() || undefined,
      });
      toast.success("Comentarios guardados");
      onUpdated();
    } catch (error: any) {
      toast.error(error?.message ?? "No se pudieron guardar los comentarios");
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (aceptar: boolean, mensaje: string) => {
    try {
      setLoading(true);
      await admisiones.solicitudesAdmision.decidir(solicitud.id, {
        aceptar,
        mensaje: mensaje || undefined,
      });
      toast.success(aceptar ? "Solicitud aceptada" : "Solicitud rechazada");
      onUpdated();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message ?? "No se pudo registrar la decisión");
    } finally {
      setLoading(false);
      reset();
    }
  };

  const familiaAccionPendiente = estado === ESTADOS.PROPUESTA && propuestas.length > 0;
  const puedeConfirmar = familiaAccionPendiente;
  const mostrarAccionesEntrevista = estado === ESTADOS.PROGRAMADA;
  const puedeDecidir = estado === ESTADOS.ENTREVISTA_REALIZADA;
  const puedeRechazar = estado === ESTADOS.PENDIENTE || estado === ESTADOS.PROPUESTA || estado === ESTADOS.PROGRAMADA;
  const puedeProgramar = estado === ESTADOS.PENDIENTE || estado === ESTADOS.PROPUESTA;
  const puedeDarDeAlta = puedeDarDeAltaSolicitud(solicitud);

  const handleDarDeAlta = () => {
    onAlta(solicitud);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Solicitud #{solicitud.id} — {aspiranteNombre}
            </DialogTitle>
          </DialogHeader>

          <section className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold">Datos del aspirante</h4>
                <p className="text-sm text-muted-foreground">
                  Curso solicitado: {formatCurso(solicitud.aspirante?.cursoSolicitado)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Disponibilidad: {availabilityLabel(solicitud)}
                </p>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" /> Fecha de solicitud: {formatDate(solicitud.fechaSolicitud)}
                </p>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  Estado actual: {estadoBadge(solicitud.estado)}
                </div>
                {cantidadPropuestas > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Se enviaron {cantidadPropuestas} propuesta{cantidadPropuestas === 1 ? "" : "s"} a la familia.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Contacto</h4>
                <p className="text-sm flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {aspiranteEmail}
                </p>
                <p className="text-sm flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {aspiranteTelefono}
                </p>
                {aspiranteDni && (
                  <p className="text-sm text-muted-foreground">DNI: {aspiranteDni}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold">Entrevista</h4>
                <p className="text-sm text-muted-foreground">
                  Respuesta límite: {formatDate(solicitud.fechaLimiteRespuesta)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Fecha confirmada: {formatDate(fechaConfirmada)}
                </p>
                <div className="space-y-1 rounded-md border p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Propuestas enviadas</p>
                  {propuestasDetalladas.length ? (
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {propuestasDetalladas.map((item, index) => (
                        <li key={`${item.fecha}-${index}`} className="flex items-start gap-2">
                          <CalendarDays className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                          <span>
                            {formatDate(item.fecha)}
                            {item.horario ? ` · ${item.horario}` : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No hay fechas propuestas.</p>
                  )}
                  {solicitud.aclaracionesPropuesta && (
                    <p className="text-xs text-muted-foreground flex items-start gap-2">
                      <StickyNote className="mt-0.5 h-3 w-3" />
                      {solicitud.aclaracionesPropuesta}
                    </p>
                  )}
                  {solicitud.comentarioReprogramacion && (
                    <p className="text-xs text-muted-foreground flex items-start gap-2">
                      <RefreshCw className="mt-0.5 h-3 w-3" />
                      {solicitud.comentarioReprogramacion}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Documentación</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {solicitud.documentosRequeridos || "Sin documentación indicada"}
                </p>
                {solicitud.adjuntosInformativos && solicitud.adjuntosInformativos.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {solicitud.adjuntosInformativos.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <FileText className="h-4 w-4" /> {url}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {puedeMostrarComentariosEntrevista && (
              <div className="space-y-2">
                <h4 className="font-semibold">Comentarios de la entrevista</h4>
                <Textarea
                  value={comentariosEntrevista}
                  onChange={(e) => setComentariosEntrevista(e.target.value)}
                  rows={4}
                  placeholder="Notas internas sobre la entrevista"
                />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleGuardarComentarios}
                    disabled={loading}
                  >
                    Guardar comentarios
                  </Button>
                </div>
              </div>
            )}

            {solicitud.notasDireccion && (
              <div>
                <h4 className="font-semibold mb-2">Notas de Dirección</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {solicitud.notasDireccion}
                </p>
              </div>
            )}

            {solicitud.motivoRechazo && estado === ESTADOS.RECHAZADA && (
              <div>
                <h4 className="font-semibold mb-2">Motivo de rechazo</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {solicitud.motivoRechazo}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              {estado === ESTADOS.PROGRAMADA && (
                <Button
                  variant="secondary"
                  onClick={() => handleResultadoEntrevista(true)}
                  disabled={loading}
                >
                  Marcar entrevista realizada
                </Button>
              )}
              {puedeDarDeAlta && (
                <Button onClick={handleDarDeAlta}>Dar de alta</Button>
              )}
              {puedeRechazar && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    setRejectOpen(true);
                    setScheduleOpen(false);
                    setConfirmDateOpen(false);
                  }}
                >
                  Rechazar
                </Button>
              )}
              {puedeProgramar && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setScheduleOpen(true);
                    setConfirmDateOpen(false);
                    setRejectOpen(false);
                  }}
                >
                  Programar cita
                </Button>
              )}
              {puedeConfirmar && (
                <Button variant="outline" onClick={() => setConfirmDateOpen(true)}>
                  Registrar fecha confirmada
                </Button>
              )}
              {puedeDecidir && (
                <div className="flex gap-2">
                  <Button onClick={() => setDecisionOpen("aceptar")}>Aceptar</Button>
                  <Button variant="destructive" onClick={() => setDecisionOpen("rechazar")}>
                    Rechazar
                  </Button>
                </div>
              )}
            </div>
          </section>
        </DialogContent>
      </Dialog>

      <RejectModal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        loading={loading}
        onSubmit={handleRechazo}
      />

      <ScheduleModal
        open={scheduleOpen}
        onOpenChange={(open) => {
          setScheduleOpen(open);
          if (!open) setPromptInterviewOpen(false);
        }}
        loading={loading}
        solicitud={solicitud}
        onSubmit={handleProgramar}
      />

      <ConfirmDateModal
        open={confirmDateOpen}
        onOpenChange={setConfirmDateOpen}
        options={propuestasDetalladas}
        loading={loading}
        onSubmit={handleConfirmarFecha}
      />

      <DecisionModal
        open={decisionOpen !== null}
        onOpenChange={(open) => !open && setDecisionOpen(null)}
        aceptar={decisionOpen === "aceptar"}
        loading={loading}
        onSubmit={handleDecision}
      />

      <AlertDialog open={promptInterviewOpen} onOpenChange={setPromptInterviewOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Se realizó la entrevista?</AlertDialogTitle>
            <AlertDialogDescription>
              La fecha programada ya pasó. Registrá el resultado para continuar con la solicitud.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                handleResultadoEntrevista(false);
              }}
            >
              No se realizó
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleResultadoEntrevista(true);
              }}
              disabled={loading}
            >
              Sí, se realizó
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function AltaModal({ open, solicitud, onOpenChange, onSuccess }: AltaModalProps) {
  const [secciones, setSecciones] = useState<DTO.SeccionDTO[]>([]);
  const [seccionesLoading, setSeccionesLoading] = useState(false);
  const [seccionesError, setSeccionesError] = useState<string | null>(null);
  const [selectedSeccionId, setSelectedSeccionId] = useState<string>("");
  const [turno, setTurno] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const aspiranteNombre = resolveAspiranteNombre(solicitud);
  const turnoPreferido = solicitud.aspirante?.turnoPreferido ?? null;

  useEffect(() => {
    if (!open) {
      setSecciones([]);
      setSeccionesError(null);
      setSelectedSeccionId("");
      setTurno("");
      return;
    }

    const initialTurno = turnoPreferido ? String(turnoPreferido) : "";
    setTurno(initialTurno);
    setSelectedSeccionId("");
    setSeccionesLoading(true);
    setSeccionesError(null);

    (async () => {
      try {
        const res = await gestionAcademica.secciones.list();
        const data = res.data ?? [];
        setSecciones(data);
        let preselected: string | null = null;
        if (initialTurno) {
          const matching = data.find(
            (sec) =>
              String(sec.turno ?? "")
                .trim()
                .toUpperCase() === initialTurno,
          );
          if (matching?.id != null) {
            preselected = String(matching.id);
          }
        }
        if (!preselected && data.length === 1 && data[0].id != null) {
          preselected = String(data[0].id);
        }
        if (preselected) {
          setSelectedSeccionId(preselected);
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
    if (!open || turno) return;
    const seccion = secciones.find((sec) => String(sec.id) === selectedSeccionId);
    if (seccion?.turno) {
      setTurno(String(seccion.turno));
    }
  }, [open, selectedSeccionId, secciones, turno]);

  const formatTurnoLabel = (value?: string | null) => {
    if (!value) return "";
    const normalized = String(value).trim().toUpperCase();
    if (normalized === DTO.Turno.MANANA) return "Mañana";
    if (normalized === DTO.Turno.TARDE) return "Tarde";
    return normalized;
  };

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

  const selectedSeccion = secciones.find((sec) => String(sec.id) === selectedSeccionId);

  const handleSubmit = async () => {
    if (!selectedSeccionId) {
      toast.error("Seleccioná una sección para el alta");
      return;
    }
    setSaving(true);
    try {
      await admisiones.solicitudesAdmision.alta(solicitud.id, {
        seccionId: Number(selectedSeccionId),
        turno: turno ? (turno as DTO.Turno) : undefined,
      });
      toast.success("Alumno dado de alta correctamente");
      onSuccess();
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
            Migrá la solicitud a un alumno matriculado. Ajustá la sección y el turno antes de confirmar.
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
            <Label className="text-sm font-medium">Sección destino</Label>
            <Select
              value={selectedSeccionId}
              onValueChange={setSelectedSeccionId}
              disabled={seccionesLoading || !secciones.length}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná la sección" />
              </SelectTrigger>
              <SelectContent>
                {secciones.map((sec) => (
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
            {!seccionesLoading && !secciones.length && !seccionesError && (
              <p className="text-xs text-muted-foreground">
                No hay secciones disponibles para matricular en este momento.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Turno</Label>
            <Select value={turno} onValueChange={setTurno}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná el turno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DTO.Turno.MANANA}>Mañana</SelectItem>
                <SelectItem value={DTO.Turno.TARDE}>Tarde</SelectItem>
              </SelectContent>
            </Select>
            {selectedSeccion?.turno && (
              <p className="text-xs text-muted-foreground">
                Turno sugerido por la sección: {formatTurnoLabel(selectedSeccion.turno)}
              </p>
            )}
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
          <Button type="button" onClick={handleSubmit} disabled={saving || !selectedSeccionId}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirmar alta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type ScheduleFormState = {
  fechas: string[];
  documentos: string;
  adjuntos: string[];
  cupoDisponible: boolean | null;
  disponibilidad: string;
  horarios: string[];
  aclaraciones: string;
};

function ScheduleModal({
  open,
  onOpenChange,
  loading,
  onSubmit,
  solicitud,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  onSubmit: (values: ScheduleFormState) => void;
  solicitud: DTO.SolicitudAdmisionDTO;
}) {
  const [fechas, setFechas] = useState<string[]>(["", "", ""]);
  const [documentos, setDocumentos] = useState(solicitud.documentosRequeridos ?? "");
  const [adjuntos, setAdjuntos] = useState<string[]>(solicitud.adjuntosInformativos ?? []);
  const [cupo, setCupo] = useState<boolean | null>(solicitud.cupoDisponible ?? null);
  const [disponibilidad, setDisponibilidad] = useState<string>(
    solicitud.disponibilidadCurso ?? "",
  );
  const [horarios, setHorarios] = useState<string[]>(["", "", ""]);
  const [aclaraciones, setAclaraciones] = useState<string>(
    solicitud.aclaracionesPropuesta ?? "",
  );

  useEffect(() => {
    if (open) {
      setFechas([
        solicitud.fechasPropuestas?.[0] ?? "",
        solicitud.fechasPropuestas?.[1] ?? "",
        solicitud.fechasPropuestas?.[2] ?? "",
      ]);
      setHorarios([
        solicitud.rangosHorariosPropuestos?.[0] ?? "",
        solicitud.rangosHorariosPropuestos?.[1] ?? "",
        solicitud.rangosHorariosPropuestos?.[2] ?? "",
      ]);
    } else {
      setFechas(["", "", ""]);
      setHorarios(["", "", ""]);
    }
    setDocumentos(solicitud.documentosRequeridos ?? "");
    setAdjuntos(solicitud.adjuntosInformativos ?? []);
    setCupo(solicitud.cupoDisponible ?? null);
    setDisponibilidad(solicitud.disponibilidadCurso ?? "");
    setAclaraciones(solicitud.aclaracionesPropuesta ?? "");
  }, [open, solicitud]);

  const handleAdjuntosChange = (value: string) => {
    const lines = value
      .split(/\n|;/)
      .map((line) => line.trim())
      .filter(Boolean);
    setAdjuntos(lines);
  };

  const propuestaNumero = solicitud.cantidadPropuestasEnviadas ?? 0;
  const reprogramacionSolicitada = solicitud.reprogramacionSolicitada;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Programar entrevista</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {(reprogramacionSolicitada || propuestaNumero >= 1) && (
            <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
              {reprogramacionSolicitada
                ? "La familia pidió otras fechas. Esta propuesta reemplaza a la anterior."
                : "Estás reenviando nuevas fechas a la familia."}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {fechas.map((value, idx) => (
              <div key={idx} className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Fecha {idx + 1}
                </label>
                <DatePicker
                  value={value || undefined}
                  onChange={(nextValue) => {
                    const next = [...fechas];
                    next[idx] = nextValue ?? "";
                    setFechas(next);
                  }}
                />
                <label className="text-xs font-medium text-muted-foreground">
                  Horario {idx + 1}
                </label>
                <Input
                  placeholder="09:00 - 11:00"
                  value={horarios[idx]}
                  onChange={(e) => {
                    const next = [...horarios];
                    next[idx] = e.target.value;
                    setHorarios(next);
                  }}
                />
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Documentación requerida
            </label>
            <Textarea
              value={documentos}
              onChange={(e) => setDocumentos(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Links/archivos PDF (uno por línea)
            </label>
            <Textarea
              value={adjuntos.join("\n")}
              onChange={(e) => handleAdjuntosChange(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Comentario sobre disponibilidad
            </label>
            <Input
              value={disponibilidad}
              onChange={(e) => setDisponibilidad(e.target.value)}
              placeholder="Disponible, sujeto a vacante, etc."
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Aclaraciones para la familia
            </label>
            <Textarea
              value={aclaraciones}
              onChange={(e) => setAclaraciones(e.target.value)}
              rows={3}
              placeholder="Ej: Traer libreta sanitaria, ingresar por secretaría, etc."
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="cupo"
              checked={cupo === true}
              onCheckedChange={(checked) => setCupo(checked ? true : false)}
            />
            <label htmlFor="cupo" className="text-sm text-muted-foreground">
              Confirmar que hay cupo disponible
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={() =>
                onSubmit({
                  fechas,
                  documentos,
                  adjuntos,
                  cupoDisponible: cupo,
                  disponibilidad,
                  horarios,
                  aclaraciones,
                })
              }
              disabled={loading}
            >
              Guardar y notificar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RejectModal({
  open,
  onOpenChange,
  loading,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  onSubmit: (motivo: string) => void;
}) {
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    if (!open) setMotivo("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rechazar solicitud</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Especificá el motivo para que la familia reciba el detalle en el correo.
          </p>
          <Textarea
            placeholder="Motivo del rechazo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => onSubmit(motivo)}
              disabled={loading}
            >
              Rechazar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type ConfirmOption = { fecha: string; horario?: string };

function ConfirmDateModal({
  open,
  onOpenChange,
  options,
  loading,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: ConfirmOption[];
  loading: boolean;
  onSubmit: (fecha: string) => void;
}) {
  const [seleccion, setSeleccion] = useState("");

  useEffect(() => {
    if (open) {
      setSeleccion(options?.[0]?.fecha ?? "");
    }
  }, [open, options]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar fecha confirmada</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Seleccioná cuál de las fechas propuestas eligió la familia.
          </p>
          <div className="space-y-2">
            {(options ?? []).map((option) => (
              <label key={option.fecha} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="fecha-confirmada"
                  value={option.fecha}
                  checked={seleccion === option.fecha}
                  onChange={(e) => setSeleccion(e.target.value)}
                />
                <span>
                  {formatDate(option.fecha)}
                  {option.horario ? ` · ${option.horario}` : ""}
                </span>
              </label>
            ))}
            {!options.length && (
              <p className="text-sm text-red-500">
                No hay fechas propuestas. Volvé a programar antes de confirmar.
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button
              onClick={() => seleccion && onSubmit(seleccion)}
              disabled={loading || !seleccion}
            >
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DecisionModal({
  open,
  onOpenChange,
  aceptar,
  loading,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aceptar: boolean;
  loading: boolean;
  onSubmit: (aceptar: boolean, mensaje: string) => void;
}) {
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!open) setMensaje("");
  }, [open]);

  const actionLabel = aceptar ? "Marcar como aceptada" : "Rechazar";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {aceptar ? "Confirmar aceptación" : "Confirmar rechazo"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {aceptar
              ? "Se marcará la solicitud como aceptada. No se enviará correo automático."
              : "Detalle el motivo (opcional) para incluir en el correo de rechazo."}
          </p>
          {!aceptar && (
            <Textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows={4}
            />
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => onSubmit(aceptar, aceptar ? "" : mensaje)}
              disabled={loading}
            >
              {actionLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
