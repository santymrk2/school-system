"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import LoadingState from "@/components/common/LoadingState";
import { BackButton } from "@/components/common/BackButton";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { logger } from "@/lib/logger";

const solicitudLogger = logger.child({ module: "dashboard-alumnos-solicitud" });

const logSolicitudError = (error: unknown, message?: string) => {
  if (message) {
    solicitudLogger.error({ err: error }, message);
  } else {
    solicitudLogger.error({ err: error });
  }
};
import {
  Calendar,
  CalendarDays,
  CircleCheck,
  Clock,
  FileText,
  RefreshCw,
  StickyNote,
  X,
} from "lucide-react";
import * as DTO from "@/types/api-generated";
import { format, parse, parseISO } from "date-fns";
import { admisiones, identidad } from "@/services/api/modules";
import { AltaModal } from "../../_components/AspirantesTabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod";

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

const formatTurno = (turno?: DTO.Turno | string | null) => {
  if (!turno && turno !== 0) return "—";
  const base: Record<string, string> = {
    MANANA: "Mañana",
    TARDE: "Tarde",
  };
  return base[String(turno)] ?? String(turno);
};

const formatBoolean = (value?: boolean | null) => {
  if (value === true) return "Sí";
  if (value === false) return "No";
  return "—";
};

const ISO_DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_TIME_REGEX = /^\d{4}-\d{2}-\d{2}T/;
const HAS_TIME_REGEX = /[T\s]\d{2}:\d{2}/;

const parseDateInput = (value?: string | null): Date | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  let parsed: Date | null = null;
  try {
    if (ISO_DATE_ONLY_REGEX.test(trimmed)) {
      parsed = parse(trimmed, "yyyy-MM-dd", new Date());
    } else if (ISO_DATE_TIME_REGEX.test(trimmed)) {
      parsed = parseISO(trimmed);
    } else {
      const timestamp = Date.parse(trimmed);
      if (!Number.isNaN(timestamp)) {
        parsed = new Date(timestamp);
      }
    }
  } catch (err) {
    return null;
  }

  if (!parsed || Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const parsed = parseDateInput(value);
  if (!parsed) {
    return value;
  }

  try {
    return format(parsed, "dd/MM/yyyy");
  } catch (err) {
    return parsed.toLocaleDateString();
  }
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  const parsed = parseDateInput(value);
  if (!parsed) {
    return value;
  }

  try {
    return format(parsed, "dd/MM/yyyy HH:mm");
  } catch (err) {
    return parsed.toLocaleString();
  }
};

const formatDateWithTime = (
  dateValue?: string | null,
  timeValue?: string | null,
) => {
  const normalizedTime = timeValue?.trim();
  if (dateValue) {
    const trimmed = dateValue.trim();
    const parsed = parseDateInput(trimmed);
    if (parsed) {
      if (HAS_TIME_REGEX.test(trimmed)) {
        return formatDateTime(trimmed);
      }
      const base = formatDate(trimmed);
      return normalizedTime ? `${base} · ${normalizedTime}` : base;
    }

    return normalizedTime ? `${trimmed} · ${normalizedTime}` : trimmed;
  }
  return normalizedTime ?? "—";
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
        <CircleCheck className="h-3 w-3" />
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

type SolicitudFamiliarItem = DTO.AspiranteFamiliarDTO & {
  persona?: DTO.PersonaDTO | null;
};

const formatParentesco = (value?: string | null) => {
  if (!value) return "—";
  const normalized = String(value).trim().toUpperCase();
  const map: Record<string, string> = {
    PADRE: "Padre",
    MADRE: "Madre",
    TUTOR: "Tutor/a",
    OTRO: "Otro/a",
  };
  return map[normalized] ?? value;
};

const resolveFamiliarNombre = (familiar: SolicitudFamiliarItem) => {
  const persona = familiar.persona;
  const nombre = persona?.nombre ?? "";
  const apellido = persona?.apellido ?? "";
  const fullName = `${nombre} ${apellido}`.trim();
  if (fullName) return fullName;
  if (persona?.dni) return `Familiar DNI ${persona.dni}`;
  return familiar.id != null ? `Familiar #${familiar.id}` : "Familiar";
};

const DetailItem = ({ label, value }: { label: string; value: ReactNode }) => {
  const isEmpty =
    value == null || (typeof value === "string" && value.trim().length === 0);
  const content = isEmpty ? "—" : value;
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="text-sm text-foreground whitespace-pre-line">{content}</div>
    </div>
  );
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
  horarios: string[];
  aclaraciones: string;
};

type ConfirmOption = { fecha: string; horario?: string; selected?: boolean };

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
  dateLabel?: string | null;
};

export default function SolicitudAdmisionDetailPage() {
  const params = useParams();
  
  const solicitudId = Number(params?.id);
  const [solicitud, setSolicitud] = useState<SolicitudAdmisionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comentariosEntrevista, setComentariosEntrevista] = useState("");
  const [promptInterviewOpen, setPromptInterviewOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [decisionOpen, setDecisionOpen] = useState<DecisionKind>(null);
  const [altaOpen, setAltaOpen] = useState(false);
  const [altaRegistrada, setAltaRegistrada] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [familiares, setFamiliares] = useState<SolicitudFamiliarItem[]>([]);
  const [familiaresLoading, setFamiliaresLoading] = useState(false);
  const [familiaresError, setFamiliaresError] = useState<string | null>(null);
  const { periodos: periodosEscolares } = useActivePeriod({ tickMidnight: false });
  const [altaPromptOpen, setAltaPromptOpen] = useState(false);
  const [pendingAutoAlta, setPendingAutoAlta] = useState({
    active: false,
    observedMaxOrder: 0,
  });
  const [altaDefaultPeriodoId, setAltaDefaultPeriodoId] = useState<number | null>(null);
  const [altaDefaultAutoNext, setAltaDefaultAutoNext] = useState(false);

  const loadFamiliares = useCallback(async (aspiranteId: number) => {
    setFamiliaresLoading(true);
    setFamiliaresError(null);
    try {
      const res = await admisiones.aspiranteFamiliares.list();
      const allFamiliares = res.data ?? [];
      const relacionados = allFamiliares.filter(
        (item) => item.aspiranteId === aspiranteId,
      );
      if (!relacionados.length) {
        setFamiliares([]);
        return;
      }

      const personaIds = relacionados
        .map((item) => item.familiarId)
        .filter((id): id is number => typeof id === "number");

      let personasMap: Record<number, DTO.PersonaDTO> = {};
      if (personaIds.length) {
        try {
          const personasRes = await identidad.personasCore.getManyById(personaIds);
          const personas = personasRes.data ?? [];
          personasMap = personas.reduce<Record<number, DTO.PersonaDTO>>(
            (acc, persona) => {
              if (persona?.id != null) {
                acc[persona.id] = persona;
              }
              return acc;
            },
            {},
          );
        } catch (personaErr) {
          logSolicitudError(
            personaErr,
            "No se pudieron cargar las personas vinculadas al grupo familiar",
          );
        }
      }

      const enriched = relacionados.map<SolicitudFamiliarItem>((item) => ({
        ...item,
        persona: item.familiarId ? personasMap[item.familiarId] ?? null : null,
      }));

      setFamiliares(enriched);
      setFamiliaresError(null);
    } catch (err: any) {
      setFamiliares([]);
      setFamiliaresError(
        err?.message ?? "No se pudieron cargar los datos de la familia.",
      );
    } finally {
      setFamiliaresLoading(false);
    }
  }, []);

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

      let aspirante: SolicitudAspirante | undefined =
        data.aspirante as SolicitudAspirante | undefined;
      const aspiranteId = data.aspiranteId ?? aspirante?.id ?? null;

      if (!aspirante && aspiranteId != null) {
        try {
          const aspiranteRes = await admisiones.aspirantes.byId(aspiranteId);
          aspirante = aspiranteRes.data as SolicitudAspirante | undefined;
        } catch (aspiranteErr) {
          logSolicitudError(
            aspiranteErr,
            "No se pudo cargar el aspirante de la solicitud",
          );
        }
      }

      let aspirantePersona: DTO.PersonaDTO | null = null;
      const personaId = aspirante?.personaId ?? data.aspirante?.personaId;
      if (personaId != null) {
        try {
          const personasRes = await identidad.personasCore.getManyById([personaId]);
          aspirantePersona = personasRes.data?.[0] ?? null;
        } catch (personaErr) {
          logSolicitudError(
            personaErr,
            "No se pudieron cargar los datos de la persona",
          );
        }
      }

      const enriched: SolicitudAdmisionItem = {
        ...data,
        aspirante,
        aspirantePersona,
        matriculaId: data.matriculaId ?? null,
        alumnoId: data.alumnoId ?? null,
      };

      const altaFromApi = resolveAltaGenerada(enriched);
      setSolicitud((prev) => {
        const previousAlta = resolveAltaGenerada(prev ?? undefined);
        const computedAlta = altaFromApi || previousAlta;
        const previousMatricula = (prev as any)?.matriculaId ?? null;
        const previousAlumno = (prev as any)?.alumnoId ?? null;
        return {
          ...enriched,
          altaGenerada: computedAlta,
          matriculaId: enriched.matriculaId ?? previousMatricula,
          alumnoId: enriched.alumnoId ?? previousAlumno,
        };
      });
      setAltaRegistrada((prev) => altaFromApi || prev);
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
    const aspiranteId = solicitud?.aspiranteId;
    if (!aspiranteId) {
      setFamiliares([]);
      setFamiliaresError(null);
      setFamiliaresLoading(false);
      return;
    }
    loadFamiliares(aspiranteId);
  }, [solicitud?.aspiranteId, loadFamiliares]);

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

  useEffect(() => {
    if (!pendingAutoAlta.active) return;
    if (!periodosEscolares || !periodosEscolares.length) return;
    if (altaOpen) return;
    const currentMaxOrder = periodosEscolares.reduce(
      (max, periodo) => Math.max(max, getPeriodoOrderValue(periodo)),
      0,
    );
    if (currentMaxOrder > pendingAutoAlta.observedMaxOrder) {
      const sorted = [...periodosEscolares].sort(
        (a, b) => getPeriodoOrderValue(a) - getPeriodoOrderValue(b),
      );
      const newest = sorted[sorted.length - 1];
      if (newest?.id != null) {
        setPendingAutoAlta({ active: false, observedMaxOrder: currentMaxOrder });
        setAltaDefaultPeriodoId(newest.id);
        setAltaDefaultAutoNext(false);
        toast.info(
          "Se creó un nuevo período lectivo. Completá el alta pendiente de esta solicitud.",
        );
        setAltaOpen(true);
      }
    }
  }, [altaOpen, pendingAutoAlta, periodosEscolares]);

  const selectedOptionIndex = useMemo(() => {
    const option = solicitud?.opcionEntrevistaSeleccionada;
    if (option == null) return null;
    const index = option - 1;
    return index >= 0 ? index : null;
  }, [solicitud?.opcionEntrevistaSeleccionada]);

  const selectedProposal = useMemo(() => {
    if (selectedOptionIndex == null || !solicitud) {
      return null;
    }
    const fecha = solicitud.fechasPropuestas?.[selectedOptionIndex] ?? null;
    const horario = solicitud.rangosHorariosPropuestos?.[selectedOptionIndex] ?? null;
    if (!fecha && !horario) {
      return null;
    }
    return { fecha, horario };
  }, [selectedOptionIndex, solicitud]);

  const propuestasDetalladas: ConfirmOption[] = useMemo(() => {
    if (!solicitud) return [];
    const propuestas = solicitud.fechasPropuestas ?? [];
    return propuestas.map((fecha, index) => ({
      fecha,
      horario: solicitud.rangosHorariosPropuestos?.[index] ?? "",
      selected: selectedOptionIndex === index,
    }));
  }, [selectedOptionIndex, solicitud]);

  const confirmedByDireccion = Boolean(solicitud?.fechaEntrevistaConfirmada);
  const familyConfirmed = Boolean(selectedProposal);
  const confirmedDateValue =
    solicitud?.fechaEntrevistaConfirmada ?? selectedProposal?.fecha ?? null;
  const confirmedTimeValue =
    solicitud?.horarioEntrevistaConfirmado ?? selectedProposal?.horario ?? null;
  const confirmedDateDisplay = useMemo(
    () => formatDateWithTime(confirmedDateValue ?? undefined, confirmedTimeValue ?? undefined),
    [confirmedDateValue, confirmedTimeValue],
  );
  const confirmedDateLabelText = confirmedByDireccion
    ? "Fecha confirmada"
    : familyConfirmed
    ? "Fecha elegida por la familia"
    : "Fecha confirmada";

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
    const hasConfirmation =
      confirmedByDireccion ||
      familyConfirmed ||
      Boolean(solicitud.fechaRespuestaFamilia);
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
        ? `Se registraron ${propuestasEnviadas} propuestas enviadas por correo.`
        : "Se cargó una propuesta para coordinar la entrevista."
      : decisionTaken && rechazada
      ? "La solicitud fue rechazada antes de enviar una propuesta."
      : "Definí las fechas y la documentación a compartir con la familia.";

    const confirmationDescription = confirmedByDireccion
      ? "Registraste la fecha pactada con la familia."
      : familyConfirmed
      ? "La familia eligió una opción. Confirmá la fecha seleccionada en la solicitud."
      : decisionTaken
      ? "La solicitud se resolvió sin registrar una confirmación."
      : hasProposal
      ? "Esperamos la respuesta por correo para actualizar la fecha acordada."
      : "Una vez que tengas la propuesta, registrá la fecha confirmada.";

    const interviewDescription = interviewDone
      ? "Se registró el resultado de la entrevista."
      : decisionTaken
      ? "La solicitud se resolvió sin realizar entrevista."
      : hasConfirmation
      ? "Después de la entrevista, registrá si se realizó y agregá comentarios internos."
      : "Aguardamos la confirmación de la familia para realizar la entrevista.";

    const decisionDescription = decisionTaken
      ? rechazada
        ? "La solicitud fue rechazada."
        : "La solicitud fue aceptada. Generá el alta cuando corresponda."
      : hasConfirmation
      ? "Definí si la solicitud será aceptada o rechazada."
      : "Registrá la fecha confirmada para habilitar la decisión final.";

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
        date:
          confirmedDateValue ??
          solicitud.fechaRespuestaFamilia ??
          selectedProposal?.fecha ??
          null,
        dateLabel: confirmedDateDisplay,
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
  }, [
    solicitud,
    confirmedByDireccion,
    confirmedDateDisplay,
    confirmedDateValue,
    familyConfirmed,
    selectedProposal,
  ]);

  const cantidadPropuestas = solicitud?.cantidadPropuestasEnviadas ?? 0;
  const puedeDarDeAlta = solicitud
    ? puedeDarDeAltaSolicitud(solicitud) && !altaRegistrada
    : false;
  const estado = solicitud ? normalizeEstado(solicitud.estado) : null;
  const puedeMostrarComentariosEntrevista = Boolean(
    solicitud?.fechaEntrevistaConfirmada,
  );
  const puedeProgramar =
    estado === ESTADOS.PENDIENTE || estado === ESTADOS.PROPUESTA;
  const tieneEntrevistaConfirmada = Boolean(solicitud?.fechaEntrevistaConfirmada);
  const puedeDecidir =
    tieneEntrevistaConfirmada &&
    estado !== ESTADOS.RECHAZADA &&
    estado !== ESTADOS.ACEPTADA;
  const puedeRechazar =
    !altaRegistrada &&
    !puedeDecidir &&
    (estado === ESTADOS.PENDIENTE ||
      estado === ESTADOS.PROPUESTA ||
      estado === ESTADOS.PROGRAMADA);

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
    try {
      setActionLoading(true);
      await admisiones.solicitudesAdmision.programar(solicitud.id, {
        fechasPropuestas: fechas,
        documentosRequeridos: form.documentos || undefined,
        adjuntosInformativos: form.adjuntos.length ? form.adjuntos : undefined,
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
      if (aceptar) {
        setAltaPromptOpen(true);
      } else {
        setAltaPromptOpen(false);
      }
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
          <BackButton />
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
        <CardHeader>
          <CardTitle>Información del formulario</CardTitle>
          <CardDescription>
            Revisá los datos que la familia completó durante la postulación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="aspirante" className="space-y-4">
            <TabsList className="flex flex-wrap gap-2 overflow-x-auto md:overflow-visible">
              <TabsTrigger value="aspirante">Datos del aspirante</TabsTrigger>
              <TabsTrigger value="hogar">Condiciones del hogar</TabsTrigger>
              <TabsTrigger value="salud">Información de salud</TabsTrigger>
              <TabsTrigger value="familia">Grupo familiar</TabsTrigger>
            </TabsList>

            <TabsContent
              value="aspirante"
              className="space-y-4 focus-visible:outline-none"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <DetailItem label="Nombre completo" value={aspiranteNombre} />
                  <DetailItem label="DNI" value={aspiranteDni ?? "—"} />
                  <DetailItem
                    label="Fecha de nacimiento"
                    value={formatDate(solicitud.aspirantePersona?.fechaNacimiento)}
                  />
                  <DetailItem
                    label="Curso solicitado"
                    value={formatCurso(solicitud.aspirante?.cursoSolicitado)}
                  />
                  <DetailItem
                    label="Turno preferido"
                    value={formatTurno(solicitud.aspirante?.turnoPreferido)}
                  />
                </div>
                <div className="space-y-4">
                  <DetailItem
                    label="Escuela actual"
                    value={solicitud.aspirante?.escuelaActual}
                  />
                  <DetailItem
                    label="Domicilio"
                    value={solicitud.aspirantePersona?.domicilio}
                  />
                  <DetailItem
                    label="Nacionalidad"
                    value={solicitud.aspirantePersona?.nacionalidad}
                  />
                  <DetailItem label="Correo de contacto" value={aspiranteEmail} />
                  <DetailItem label="Teléfono" value={aspiranteTelefono} />
                </div>
              </div>
              {solicitud.notasDireccion && (
                <div className="rounded-md border bg-muted/60 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Notas de dirección
                  </p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {solicitud.notasDireccion}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="hogar"
              className="space-y-4 focus-visible:outline-none"
            >
              <DetailItem
                label="Tipo de conectividad a Internet"
                value={solicitud.aspirante?.conectividadInternet}
              />
              <DetailItem
                label="Dispositivos disponibles para la escolaridad"
                value={solicitud.aspirante?.dispositivosDisponibles}
              />
              <DetailItem
                label="Idiomas hablados en el hogar"
                value={solicitud.aspirante?.idiomasHabladosHogar}
              />
            </TabsContent>

            <TabsContent
              value="salud"
              className="space-y-4 focus-visible:outline-none"
            >
              <DetailItem
                label="Enfermedades o alergias"
                value={solicitud.aspirante?.enfermedadesAlergias}
              />
              <DetailItem
                label="Medicación habitual"
                value={solicitud.aspirante?.medicacionHabitual}
              />
              <DetailItem
                label="Limitaciones físicas o neurológicas"
                value={solicitud.aspirante?.limitacionesFisicas}
              />
              <DetailItem
                label="Tratamientos terapéuticos en curso"
                value={solicitud.aspirante?.tratamientosTerapeuticos}
              />
              <DetailItem
                label="Uso de ayudas de movilidad"
                value={formatBoolean(solicitud.aspirante?.usoAyudasMovilidad)}
              />
              <DetailItem
                label="Cobertura médica"
                value={solicitud.aspirante?.coberturaMedica}
              />
              <DetailItem
                label="Observaciones adicionales"
                value={solicitud.aspirante?.observacionesSalud}
              />
            </TabsContent>

            <TabsContent
              value="familia"
              className="space-y-4 focus-visible:outline-none"
            >
              {familiaresLoading ? (
                <LoadingState
                  label="Cargando datos de la familia…"
                  className="h-32"
                  iconClassName="h-5 w-5"
                />
              ) : familiaresError ? (
                <Alert variant="destructive">
                  <AlertTitle>Error al cargar la familia</AlertTitle>
                  <AlertDescription>{familiaresError}</AlertDescription>
                </Alert>
              ) : familiares.length ? (
                <div className="space-y-4">
                  {familiares.map((familiar) => (
                    <div
                      key={familiar.id ?? `${familiar.aspiranteId}-${familiar.familiarId}`}
                      className="space-y-4 rounded-lg border p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-foreground">
                            {resolveFamiliarNombre(familiar)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatParentesco(familiar.parentesco)}
                          </p>
                        </div>
                        {familiar.convive != null && (
                          <Badge
                            variant={familiar.convive ? "default" : "outline"}
                            className="text-xs"
                          >
                            {familiar.convive ? "Convive" : "No convive"}
                          </Badge>
                        )}
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <DetailItem
                          label="DNI"
                          value={familiar.persona?.dni}
                        />
                        <DetailItem
                          label="Fecha de nacimiento"
                          value={formatDate(familiar.persona?.fechaNacimiento)}
                        />
                        <DetailItem
                          label="Teléfono"
                          value={familiar.persona?.telefono}
                        />
                        <DetailItem
                          label="Celular"
                          value={familiar.persona?.celular}
                        />
                        <DetailItem
                          label="Correo electrónico"
                          value={familiar.persona?.email}
                        />
                        <DetailItem
                          label="Domicilio"
                          value={familiar.persona?.domicilio}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay familiares registrados para esta solicitud.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h2 className="font-semibold">Entrevista</h2>
              <p className="text-sm text-muted-foreground">
                Respuesta límite: {formatDate(solicitud.fechaLimiteRespuesta)}
              </p>
              <p className="text-sm text-muted-foreground">
                {confirmedDateLabelText}: {confirmedDateDisplay}
              </p>
              {solicitud.opcionEntrevistaSeleccionada && (
                <p className="text-sm text-muted-foreground">
                  Opción elegida: Opción {solicitud.opcionEntrevistaSeleccionada}
                </p>
              )}
              <div className="space-y-2 rounded-md border p-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Propuestas enviadas
                </p>
                {propuestasDetalladas.length ? (
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {propuestasDetalladas.map((item, index) => (
                      <li key={`${item.fecha}-${index}`} className="flex items-start gap-2">
                        <CalendarDays className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                        <div className="space-y-1">
                          <span>
                            {formatDate(item.fecha)}
                            {item.horario ? ` · ${item.horario}` : ""}
                          </span>
                          {item.selected && (
                            <span className="flex items-center gap-1 text-xs text-emerald-600">
                              <CircleCheck className="h-3 w-3" /> Elegida por la familia
                            </span>
                          )}
                        </div>
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
                rows={4}
                readOnly
                disabled
                placeholder="Notas internas sobre la entrevista"
              />
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
        <CardContent className="flex flex-col gap-3">
          {pendingAutoAlta.active && (
            <Alert>
              <AlertTitle>Alta pendiente para el próximo período</AlertTitle>
              <AlertDescription>
                Te avisaremos cuando se cree un nuevo período lectivo para completar la
                asignación.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-2">
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
          </div>
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

      <AltaPromptDialog
        open={altaPromptOpen}
        onCancel={() => setAltaPromptOpen(false)}
        onConfirm={() => {
          setAltaPromptOpen(false);
          setAltaDefaultPeriodoId(null);
          setAltaDefaultAutoNext(false);
          setAltaOpen(true);
        }}
      />

      <AltaModal
        open={altaOpen}
        solicitud={solicitud}
        defaultPeriodoId={altaDefaultPeriodoId ?? undefined}
        defaultAutoNext={altaDefaultAutoNext}
        onOpenChange={(open) => {
          setAltaOpen(open);
          if (!open) {
            setAltaDefaultPeriodoId(null);
            setAltaDefaultAutoNext(false);
          }
        }}
        onAutoAssignNextRequest={({ currentMaxOrder }) => {
          setPendingAutoAlta({ active: true, observedMaxOrder: currentMaxOrder });
          setAltaDefaultPeriodoId(null);
          setAltaDefaultAutoNext(true);
          setAltaOpen(false);
          setAltaPromptOpen(false);
        }}
        onAutoAssignNextCancelled={() => {
          setPendingAutoAlta((prev) =>
            prev.active ? { active: false, observedMaxOrder: prev.observedMaxOrder } : prev,
          );
          setAltaDefaultAutoNext(false);
        }}
        onSuccess={(result) => {
          setAltaOpen(false);
          setAltaRegistrada(true);
          setPendingAutoAlta({ active: false, observedMaxOrder: 0 });
          setAltaDefaultPeriodoId(null);
          setAltaDefaultAutoNext(false);
          setSolicitud((prev) =>
            prev
              ? {
                  ...prev,
                  altaGenerada: true,
                  matriculaId: result?.matriculaId ?? (prev as any)?.matriculaId ?? null,
                  alumnoId: result?.alumnoId ?? (prev as any)?.alumnoId ?? null,
                }
              : prev,
          );
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
                  <CircleCheck className="h-4 w-4" />
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
                {(item.dateLabel || item.date) && (
                  <span className="text-xs text-muted-foreground">
                    {item.dateLabel ?? formatDate(item.date)}
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

const normalizeHorario = (value?: string | null) => {
  if (!value) return "";
  const match = String(value).match(/(\d{1,2}:\d{2})/);
  if (!match) return "";
  const [hours, minutes] = match[1].split(":");
  const hh = hours.padStart(2, "0");
  return `${hh}:${minutes}`;
};

const SCHEDULE_SLOT_COUNT = 2;

const createEmptySlots = () =>
  Array.from({ length: SCHEDULE_SLOT_COUNT }, () => "");

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
  const [fechas, setFechas] = useState<string[]>(createEmptySlots());
  const [documentos, setDocumentos] = useState(solicitud.documentosRequeridos ?? "");
  const [adjuntos, setAdjuntos] = useState<string[]>(solicitud.adjuntosInformativos ?? []);
  const [horarios, setHorarios] = useState<string[]>(createEmptySlots());
  const [aclaraciones, setAclaraciones] = useState<string>(
    solicitud.aclaracionesPropuesta ?? "",
  );
  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  useEffect(() => {
    if (open) {
      setFechas(
        Array.from({ length: SCHEDULE_SLOT_COUNT }, (_, index) =>
          solicitud.fechasPropuestas?.[index] ?? "",
        ),
      );
      setHorarios(
        Array.from({ length: SCHEDULE_SLOT_COUNT }, (_, index) =>
          normalizeHorario(solicitud.rangosHorariosPropuestos?.[index]),
        ),
      );
    } else {
      setFechas(createEmptySlots());
      setHorarios(createEmptySlots());
    }
    setDocumentos(solicitud.documentosRequeridos ?? "");
    setAdjuntos(solicitud.adjuntosInformativos ?? []);
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

          <p className="text-xs text-muted-foreground">
            El correo le pide a la familia que responda confirmando el horario que prefieran.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fechas.map((value, idx) => (
              <div key={idx} className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Fecha {idx + 1}
                </label>
                <DatePicker
                  value={value}
                  min={today}
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
                  type="time"
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
              Aclaraciones para la familia
            </label>
            <Textarea
              value={aclaraciones}
              onChange={(e) => setAclaraciones(e.target.value)}
              rows={3}
              placeholder="Ej: Traer libreta sanitaria, ingresar por secretaría, etc."
            />
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
                  horarios,
                  aclaraciones,
                })
              }
              disabled={loading}
            >
              Guardar propuesta
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
              ? "Se marcará la solicitud como aceptada. Luego podrás decidir si dar de alta ahora."
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

function AltaPromptDialog({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          onCancel();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Querés dar de alta ahora?</DialogTitle>
          <DialogDescription>
            Podés asignar la solicitud a una sección y período lectivo inmediatamente o hacerlo más
            tarde desde este mismo detalle.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Más tarde
          </Button>
          <Button type="button" onClick={onConfirm}>
            Elegir período y sección
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
