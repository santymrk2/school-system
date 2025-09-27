"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import LoadingState from "@/components/common/LoadingState";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, CalendarDays, CheckCircle, Clock, FileText, Mail, Phone, RefreshCw, StickyNote, X, ArrowLeft } from "lucide-react";
import * as DTO from "@/types/api-generated";
import { admisiones, identidad } from "@/services/api/modules";
import { AltaModal } from "../../_components/AspirantesTabs";

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
        <CheckCircle className="h-3 w-3" />
        {e === ESTADOS.ACEPTADA ? "Aceptada" : "Entrevista"}
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

type ScheduleFormState = {
  fechas: string[];
  documentos: string;
  adjuntos: string[];
  cupoDisponible: boolean | null;
  disponibilidad: string;
  horarios: string[];
  aclaraciones: string;
};

type ConfirmOption = { fecha: string; horario?: string };

type DecisionKind = "aceptar" | "rechazar" | null;

type TimelineStatus = "done" | "current" | "upcoming" | "skipped";

type TimelineKey =
  | "received"
  | "proposal"
  | "confirmation"
  | "interview"
  | "decision";

type TimelineItem = {
  key: TimelineKey;
  title: string;
  description: string;
  status: TimelineStatus;
  date?: string | null;
};

export default function SolicitudAdmisionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const solicitudId = Number(params?.id);
  const [solicitud, setSolicitud] = useState<SolicitudAdmisionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comentariosEntrevista, setComentariosEntrevista] = useState("");
  const [promptInterviewOpen, setPromptInterviewOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [confirmDateOpen, setConfirmDateOpen] = useState(false);
  const [decisionOpen, setDecisionOpen] = useState<DecisionKind>(null);
  const [altaOpen, setAltaOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSolicitud = useCallback(async () => {
    if (!Number.isFinite(solicitudId)) {
      setError("Identificador de solicitud inválido");
      setSolicitud(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await admisiones.solicitudesAdmision.getById(solicitudId);
      const data = res.data;
      if (!data) {
        setSolicitud(null);
        setError("No se encontró la solicitud");
        return;
      }

      let aspirantePersona: DTO.PersonaDTO | null = null;
      const personaId = data.aspirante?.personaId;
      if (personaId != null) {
        try {
          const personasRes = await identidad.personasCore.getManyById([personaId]);
          aspirantePersona = personasRes.data?.[0] ?? null;
        } catch (personaErr) {
          // eslint-disable-next-line no-console
          console.error("No se pudieron cargar los datos de la persona", personaErr);
        }
      }

      const enriched: SolicitudAdmisionItem = {
        ...data,
        aspirantePersona,
      };

      setSolicitud(enriched);
      setComentariosEntrevista(enriched.comentariosEntrevista ?? "");
    } catch (err: any) {
      setSolicitud(null);
      setError(err?.message ?? "No se pudo obtener la solicitud.");
    } finally {
      setLoading(false);
    }
  }, [solicitudId]);

  useEffect(() => {
    fetchSolicitud();
  }, [fetchSolicitud]);

  useEffect(() => {
    if (!solicitud) return;
    const estado = normalizeEstado(solicitud.estado);
    if (
      estado === ESTADOS.PROGRAMADA &&
      solicitud.fechaEntrevistaConfirmada &&
      !solicitud.entrevistaRealizada
    ) {
      const fecha = new Date(solicitud.fechaEntrevistaConfirmada);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      fecha.setHours(0, 0, 0, 0);
      if (fecha <= hoy) {
        setPromptInterviewOpen(true);
      }
    }
  }, [solicitud]);

  const propuestasDetalladas: ConfirmOption[] = useMemo(() => {
    if (!solicitud) return [];
    const propuestas = solicitud.fechasPropuestas ?? [];
    return propuestas.map((fecha, index) => ({
      fecha,
      horario: solicitud.rangosHorariosPropuestos?.[index] ?? "",
    }));
  }, [solicitud]);

  const timelineItems = useMemo<TimelineItem[]>(() => {
    if (!solicitud) return [];

    const estadoActual = normalizeEstado(solicitud.estado);
    const propuestasEnviadas =
      solicitud.cantidadPropuestasEnviadas ??
      (solicitud.fechasPropuestas && solicitud.fechasPropuestas.length > 0
        ? 1
        : 0);
    const hasProposal =
      (solicitud.fechasPropuestas?.length ?? 0) > 0 ||
      estadoActual === ESTADOS.PROGRAMADA ||
      estadoActual === ESTADOS.PROPUESTA;
    const hasConfirmation = Boolean(solicitud.fechaEntrevistaConfirmada);
    const interviewDone =
      Boolean(solicitud.entrevistaRealizada) ||
      estadoActual === ESTADOS.ENTREVISTA_REALIZADA ||
      estadoActual === ESTADOS.ACEPTADA ||
      estadoActual === ESTADOS.RECHAZADA;
    const decisionTaken =
      estadoActual === ESTADOS.ACEPTADA || estadoActual === ESTADOS.RECHAZADA;
    const rechazada = estadoActual === ESTADOS.RECHAZADA;
    let currentKey: TimelineKey = "proposal";
    if (decisionTaken) {
      currentKey = "decision";
    } else if (interviewDone) {
      currentKey = "decision";
    } else if (hasConfirmation) {
      currentKey = "interview";
    } else if (hasProposal) {
      currentKey = "confirmation";
    } else {
      currentKey = "proposal";
    }

    const proposalDescription = hasProposal
      ? propuestasEnviadas > 1
        ? `Se enviaron ${propuestasEnviadas} propuestas a la familia.`
        : "Se envió una propuesta de entrevista a la familia."
      : decisionTaken && rechazada
      ? "La solicitud fue rechazada antes de enviar una propuesta."
      : "Definí fechas y documentación para enviar a la familia.";

    const confirmationDescription = hasConfirmation
      ? "La familia confirmó la fecha de la entrevista."
      : decisionTaken
      ? "La solicitud se resolvió sin registrar una confirmación."
      : hasProposal
      ? "Esperamos la confirmación de la familia."
      : "Una vez que envíes la propuesta, registrá la respuesta de la familia.";

    const interviewDescription = interviewDone
      ? "Se registró el resultado de la entrevista."
      : decisionTaken
      ? "La solicitud se resolvió sin realizar entrevista."
      : hasConfirmation
      ? "Después de la entrevista, registrá si se realizó y agregá comentarios."
      : "Aguardamos la confirmación de fecha para realizar la entrevista.";

    const decisionDescription = decisionTaken
      ? rechazada
        ? "La solicitud fue rechazada."
        : "La solicitud fue aceptada. Generá el alta cuando corresponda."
      : interviewDone
      ? "Definí si la solicitud será aceptada o rechazada."
      : "Registrá el resultado de la entrevista para habilitar la decisión final.";

    const steps: Array<Omit<TimelineItem, "status">> = [
      {
        key: "received",
        title: "Solicitud recibida",
        description:
          "La familia completó el formulario y la solicitud está disponible para revisión.",
        date: solicitud.fechaSolicitud,
      },
      {
        key: "proposal",
        title: "Propuesta de entrevista",
        description: proposalDescription,
        date:
          solicitud.fechasPropuestas?.[solicitud.fechasPropuestas.length - 1] ??
          null,
      },
      {
        key: "confirmation",
        title: "Confirmación de la familia",
        description: confirmationDescription,
        date: solicitud.fechaEntrevistaConfirmada ?? solicitud.fechaRespuestaFamilia,
      },
      {
        key: "interview",
        title: "Entrevista",
        description: interviewDescription,
      },
      {
        key: "decision",
        title: "Decisión final",
        description: decisionDescription,
      },
    ];

    return steps.map((step, index) => {
      const completed =
        step.key === "received" ||
        (step.key === "proposal" && hasProposal) ||
        (step.key === "confirmation" && hasConfirmation) ||
        (step.key === "interview" && interviewDone) ||
        (step.key === "decision" && decisionTaken);
      const skipped =
        decisionTaken && !completed && step.key !== "decision" && index > 0;

      let status: TimelineStatus;
      if (completed) {
        status = "done";
      } else if (skipped) {
        status = "skipped";
      } else if (step.key === currentKey) {
        status = "current";
      } else {
        status = "upcoming";
      }

      return {
        ...step,
        status,
      };
    });
  }, [solicitud]);

  const cantidadPropuestas = solicitud?.cantidadPropuestasEnviadas ?? 0;
  const puedeDarDeAlta = solicitud ? puedeDarDeAltaSolicitud(solicitud) : false;
  const estado = solicitud ? normalizeEstado(solicitud.estado) : null;
  const puedeMostrarComentariosEntrevista = Boolean(
    solicitud?.fechaEntrevistaConfirmada,
  );
  const puedeConfirmar =
    estado === ESTADOS.PROPUESTA && (solicitud?.fechasPropuestas?.length ?? 0) > 0;
  const puedeProgramar =
    estado === ESTADOS.PENDIENTE || estado === ESTADOS.PROPUESTA;
  const puedeRechazar =
    estado === ESTADOS.PENDIENTE ||
    estado === ESTADOS.PROPUESTA ||
    estado === ESTADOS.PROGRAMADA;
  const puedeDecidir = estado === ESTADOS.ENTREVISTA_REALIZADA;

  const handleRechazo = async (motivo: string) => {
    if (!solicitud) return;
    if (!motivo.trim()) {
      toast.error("Indicá un motivo para rechazar");
      return;
    }
    try {
      setActionLoading(true);
      await admisiones.solicitudesAdmision.rechazar(solicitud.id, { motivo });
      toast.success("Solicitud rechazada");
      setRejectOpen(false);
      fetchSolicitud();
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo rechazar");
    } finally {
      setActionLoading(false);
    }
  };

  const handleProgramar = async (form: ScheduleFormState) => {
    if (!solicitud) return;
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
      setActionLoading(true);
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
      setScheduleOpen(false);
      fetchSolicitud();
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo programar la entrevista");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmarFecha = async (fecha: string) => {
    if (!solicitud) return;
    try {
      setActionLoading(true);
      await admisiones.solicitudesAdmision.confirmarFecha(solicitud.id, {
        fechaSeleccionada: fecha,
      });
      toast.success("Fecha de entrevista confirmada");
      setConfirmDateOpen(false);
      fetchSolicitud();
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo registrar la fecha");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResultadoEntrevista = async (realizada: boolean) => {
    if (!solicitud) return;
    try {
      setActionLoading(true);
      await admisiones.solicitudesAdmision.registrarEntrevista(solicitud.id, {
        realizada,
        comentarios: realizada
          ? comentariosEntrevista.trim() || undefined
          : undefined,
      });
      toast.success(
        realizada
          ? "Entrevista marcada como realizada"
          : "Se habilitó la reprogramación",
      );
      setPromptInterviewOpen(false);
      if (realizada) {
        fetchSolicitud();
      } else {
        setScheduleOpen(true);
      }
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo actualizar la entrevista");
    } finally {
      setActionLoading(false);
    }
  };

  const handleGuardarComentarios = async () => {
    if (!solicitud) return;
    try {
      setActionLoading(true);
      await admisiones.solicitudesAdmision.registrarEntrevista(solicitud.id, {
        comentarios: comentariosEntrevista.trim() || undefined,
      });
      toast.success("Comentarios guardados");
      fetchSolicitud();
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudieron guardar los comentarios");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecision = async (aceptar: boolean, mensaje: string) => {
    if (!solicitud) return;
    try {
      setActionLoading(true);
      await admisiones.solicitudesAdmision.decidir(solicitud.id, {
        aceptar,
        mensaje: mensaje || undefined,
      });
      toast.success(aceptar ? "Solicitud aceptada" : "Solicitud rechazada");
      setDecisionOpen(null);
      fetchSolicitud();
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo registrar la decisión");
    } finally {
      setActionLoading(false);
    }
  };

  if (!Number.isFinite(solicitudId)) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Solicitud no válida</CardTitle>
            <CardDescription>
              El identificador proporcionado no corresponde a una solicitud válida.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <LoadingState label="Cargando solicitud…" />;
  }

  if (error) {
    return (
      <div className="space-y-4 p-6">
        <Alert variant="destructive">
          <AlertTitle>Error al cargar la solicitud</AlertTitle>
          <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {error}
            <Button type="button" variant="outline" size="sm" onClick={fetchSolicitud}>
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!solicitud) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Solicitud no encontrada</CardTitle>
            <CardDescription>
              No encontramos la solicitud indicada. Volvé al listado para intentarlo nuevamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/alumnos">Volver al listado</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const aspiranteNombre = resolveAspiranteNombre(solicitud);
  const aspiranteEmail = resolveAspiranteEmail(solicitud);
  const aspiranteTelefono = resolveAspiranteTelefono(solicitud);
  const aspiranteDni = solicitud.aspirantePersona?.dni ?? null;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {estadoBadge(solicitud.estado)}
          {cantidadPropuestas > 1 && (
            <Badge variant="secondary">{cantidadPropuestas}ª propuesta</Badge>
          )}
          {solicitud.reprogramacionSolicitada && (
            <Badge variant="outline" className="gap-1 border-dashed">
              <RefreshCw className="h-3 w-3" /> Reprogramación
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">
          Solicitud #{solicitud.id} — {aspiranteNombre}
        </h1>
        <p className="text-sm text-muted-foreground">
          Recibida el {formatDate(solicitud.fechaSolicitud)}
        </p>
      </div>

      {timelineItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Línea de tiempo de la solicitud</CardTitle>
            <CardDescription>
              Revisá el recorrido de la solicitud y los próximos pasos sugeridos.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Timeline items={timelineItems} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h2 className="font-semibold">Datos del aspirante</h2>
              <p className="text-sm text-muted-foreground">
                Curso solicitado: {formatCurso(solicitud.aspirante?.cursoSolicitado)}
              </p>
              <p className="text-sm text-muted-foreground">
                Disponibilidad: {availabilityLabel(solicitud)}
              </p>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" /> Fecha de solicitud: {formatDate(
                  solicitud.fechaSolicitud,
                )}
              </p>
              {solicitud.notasDireccion && (
                <div className="rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
                  {solicitud.notasDireccion}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h2 className="font-semibold">Contacto</h2>
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
              <h2 className="font-semibold">Entrevista</h2>
              <p className="text-sm text-muted-foreground">
                Respuesta límite: {formatDate(solicitud.fechaLimiteRespuesta)}
              </p>
              <p className="text-sm text-muted-foreground">
                Fecha confirmada: {formatDate(solicitud.fechaEntrevistaConfirmada)}
              </p>
              <div className="space-y-2 rounded-md border p-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Propuestas enviadas
                </p>
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
              <h2 className="font-semibold">Documentación</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {solicitud.documentosRequeridos || "Sin documentación indicada"}
              </p>
              {solicitud.adjuntosInformativos &&
                solicitud.adjuntosInformativos.length > 0 && (
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

          {solicitud.motivoRechazo && estado === ESTADOS.RECHAZADA && (
            <div>
              <h2 className="font-semibold mb-2">Motivo de rechazo</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {solicitud.motivoRechazo}
              </p>
            </div>
          )}

          {puedeMostrarComentariosEntrevista && (
            <div className="space-y-2">
              <h2 className="font-semibold">Comentarios de la entrevista</h2>
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
                  disabled={actionLoading}
                >
                  Guardar comentarios
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acciones</CardTitle>
          <CardDescription>
            Actualizá el estado de la solicitud según el avance con la familia.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {estado === ESTADOS.PROGRAMADA && (
            <Button
              variant="secondary"
              onClick={() => handleResultadoEntrevista(true)}
              disabled={actionLoading}
            >
              Marcar entrevista realizada
            </Button>
          )}
          {puedeDarDeAlta && (
            <Button onClick={() => setAltaOpen(true)} disabled={actionLoading}>
              Dar de alta
            </Button>
          )}
          {puedeProgramar && (
            <Button
              variant="outline"
              onClick={() => setScheduleOpen(true)}
              disabled={actionLoading}
            >
              Programar entrevista
            </Button>
          )}
          {puedeConfirmar && (
            <Button
              variant="outline"
              onClick={() => setConfirmDateOpen(true)}
              disabled={actionLoading}
            >
              Registrar fecha confirmada
            </Button>
          )}
          {puedeRechazar && (
            <Button
              variant="destructive"
              onClick={() => setRejectOpen(true)}
              disabled={actionLoading}
            >
              Rechazar solicitud
            </Button>
          )}
          {puedeDecidir && (
            <div className="flex gap-2">
              <Button onClick={() => setDecisionOpen("aceptar")} disabled={actionLoading}>
                Aceptar
              </Button>
              <Button
                variant="destructive"
                onClick={() => setDecisionOpen("rechazar")}
                disabled={actionLoading}
              >
                Rechazar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <RejectModal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        loading={actionLoading}
        onSubmit={handleRechazo}
      />

      <ScheduleModal
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        loading={actionLoading}
        solicitud={solicitud}
        onSubmit={handleProgramar}
      />

      <ConfirmDateModal
        open={confirmDateOpen}
        onOpenChange={setConfirmDateOpen}
        options={propuestasDetalladas}
        loading={actionLoading}
        onSubmit={handleConfirmarFecha}
      />

      <DecisionModal
        open={decisionOpen !== null}
        onOpenChange={(open) => !open && setDecisionOpen(null)}
        aceptar={decisionOpen === "aceptar"}
        loading={actionLoading}
        onSubmit={handleDecision}
      />

      <InterviewPromptDialog
        open={promptInterviewOpen}
        onOpenChange={setPromptInterviewOpen}
        loading={actionLoading}
        onSubmit={handleResultadoEntrevista}
      />

      <AltaModal
        open={altaOpen}
        solicitud={solicitud}
        onOpenChange={setAltaOpen}
        onSuccess={() => {
          setAltaOpen(false);
          fetchSolicitud();
        }}
      />
    </div>
  );
}

const TIMELINE_VARIANTS: Record<TimelineStatus, string> = {
  done: "border-primary bg-primary text-primary-foreground",
  current: "border-primary bg-background text-primary",
  upcoming: "border-muted-foreground/40 bg-background text-muted-foreground",
  skipped: "border-muted-foreground/40 bg-muted text-muted-foreground",
};

function Timeline({ items }: { items: TimelineItem[] }) {
  if (!items.length) return null;

  return (
    <ol className="space-y-6 py-6">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <li key={item.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm ${TIMELINE_VARIANTS[item.status]}`}
              >
                {item.status === "done" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : item.status === "current" ? (
                  <Clock className="h-4 w-4" />
                ) : item.status === "skipped" ? (
                  <X className="h-4 w-4" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                )}
              </span>
              {!isLast && (
                <span
                  className="mt-1 h-full w-px flex-1 bg-border"
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold">{item.title}</h3>
                {item.date && (
                  <span className="text-xs text-muted-foreground">
                    {formatDate(item.date)}
                  </span>
                )}
                {item.status === "current" && (
                  <Badge variant="outline" className="text-[10px] uppercase">
                    En curso
                  </Badge>
                )}
                {item.status === "skipped" && (
                  <Badge variant="secondary" className="text-[10px] uppercase">
                    No aplica
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

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
                <Input
                  type="date"
                  value={value}
                  onChange={(e) => {
                    const next = [...fechas];
                    next[idx] = e.target.value;
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

function InterviewPromptDialog({
  open,
  onOpenChange,
  loading,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  onSubmit: (realizada: boolean) => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
              onSubmit(false);
            }}
          >
            No se realizó
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onSubmit(true);
            }}
            disabled={loading}
          >
            Sí, se realizó
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
