"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LoadingState from "@/components/common/LoadingState";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/common/BackButton";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Step3 as HogarForm } from "@/app/postulacion/Step3";
import { Step4 as SaludForm } from "@/app/postulacion/Step4";
import type { PostulacionFormData } from "@/app/postulacion/types";
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
  DialogTrigger,
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
import { formatTurnoLabel } from "@/lib/turno-label";
import { Loader2, UserMinus, Info } from "lucide-react";
import { toast } from "sonner";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod";
import { useViewerScope } from "@/hooks/scope/useViewerScope";
import { logger } from "@/lib/logger";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const alumnosLogger = logger.child({ module: "dashboard-alumnos-detalle" });

const logAlumnoError = (error: unknown, message?: string) => {
  if (message) {
    alumnosLogger.error({ err: error }, message);
  } else {
    alumnosLogger.error({ err: error });
  }
};
import { useAuth } from "@/hooks/useAuth";
import {
  formatDni,
  isBirthDateValid,
  maxBirthDate,
  onlyDigits,
} from "@/lib/form-utils";
import { displayRole, normalizeRoles } from "@/lib/auth-roles";
import {
  DEFAULT_GENERO_VALUE,
  GENERO_OPTIONS,
  normalizeGenero,
} from "@/lib/genero";
import {
  gestionAcademica,
  identidad,
  vidaEscolar,
} from "@/services/api/modules";
import type {
  AlumnoDTO,
  FamiliarDTO,
  MatriculaDTO,
  MatriculaSeccionHistorialDTO,
  PersonaCreateDTO,
  PersonaDTO,
  PersonaUpdateDTO,
  SeccionDTO,
} from "@/types/api-generated";
import {
  EstadoRevisionAdministrativa,
  EstadoSolicitudBaja,
  RolVinculo,
  SolicitudBajaAlumnoDTO,
  UserRole,
} from "@/types/api-generated";

type FamiliarConVinculo = FamiliarDTO & {
  parentesco?: string;
  _persona?: PersonaDTO | null;
  rolVinculo?: RolVinculo | null;
  convive?: boolean;
};

type HistorialVM = {
  id: number;
  matriculaId: number;
  seccionId: number;
  desde?: string | null;
  hasta?: string | null;
  seccionLabel?: string;
};

type CredentialsFormState = {
  email: string;
  password: string;
  confirmPassword: string;
  roles: UserRole[];
};

type AspiranteComplementoForm = Pick<
  PostulacionFormData,
  |
    "conectividadInternet"
    | "dispositivosDisponibles"
    | "idiomasHabladosHogar"
    | "enfermedadesAlergias"
    | "medicacionHabitual"
    | "limitacionesFisicasNeurologicas"
    | "tratamientosTerapeuticos"
    | "usoAyudasMovilidad"
    | "coberturaMedica"
    | "observacionesAdicionalesSalud"
>;

const emptyAspiranteComplemento: AspiranteComplementoForm = {
  conectividadInternet: "",
  dispositivosDisponibles: "",
  idiomasHabladosHogar: "",
  enfermedadesAlergias: "",
  medicacionHabitual: "",
  limitacionesFisicasNeurologicas: "",
  tratamientosTerapeuticos: "",
  usoAyudasMovilidad: false,
  coberturaMedica: "",
  observacionesAdicionalesSalud: "",
};

export default function AlumnoPerfilPage() {
  const { id } = useParams<{ id: string }>();
  const alumnoId = Number(id);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [alumno, setAlumno] = useState<AlumnoDTO | null>(null);
  const [persona, setPersona] = useState<PersonaDTO | null>(null);

  const [matriculas, setMatriculas] = useState<MatriculaDTO[]>([]);
  const [historial, setHistorial] = useState<HistorialVM[]>([]);
  const [seccionesMap, setSeccionesMap] = useState<Map<number, SeccionDTO>>(
    new Map(),
  );
  const [seccionesList, setSeccionesList] = useState<SeccionDTO[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [crearBajaOpen, setCrearBajaOpen] = useState(false);
  const [crearBajaMotivo, setCrearBajaMotivo] = useState("");
  const [crearBajaLoading, setCrearBajaLoading] = useState(false);
  const [solicitudesBaja, setSolicitudesBaja] = useState<
    SolicitudBajaAlumnoDTO[]
  >([]);
  const [loadingSolicitudesBaja, setLoadingSolicitudesBaja] =
    useState(false);
  const [solicitudesBajaError, setSolicitudesBajaError] =
    useState<string | null>(null);
  const [processingDecisionSolicitudId, setProcessingDecisionSolicitudId] =
    useState<number | null>(null);
  const [approveDialogSolicitud, setApproveDialogSolicitud] = useState<
    SolicitudBajaAlumnoDTO | null
  >(null);
  const [rejectDialogSolicitud, setRejectDialogSolicitud] = useState<
    SolicitudBajaAlumnoDTO | null
  >(null);
  const [rejectMotivo, setRejectMotivo] = useState("");

  const [familiares, setFamiliares] = useState<FamiliarConVinculo[]>([]);

  const { periodoEscolarId: activePeriodId, getPeriodoNombre } = useActivePeriod();
  const { hasRole, user } = useAuth();
  const { type: viewerScope } = useViewerScope();
  const canManageProfile = viewerScope === "staff";
  const canEditRoles =
    canManageProfile && (hasRole(UserRole.ADMIN) || hasRole(UserRole.DIRECTOR));
  const personaActualId = useMemo(
    () => user?.personaId ?? user?.id ?? null,
    [user],
  );
  const puedeDecidirBaja =
    viewerScope === "staff" && hasRole(UserRole.DIRECTOR);

  const estadoSolicitudLabels: Record<EstadoSolicitudBaja, string> = {
    [EstadoSolicitudBaja.PENDIENTE]: "Pendiente",
    [EstadoSolicitudBaja.APROBADA]: "Aprobada",
    [EstadoSolicitudBaja.RECHAZADA]: "Rechazada",
  };

  const estadoSolicitudVariant: Record<
    EstadoSolicitudBaja,
    "secondary" | "default" | "destructive"
  > = {
    [EstadoSolicitudBaja.PENDIENTE]: "secondary",
    [EstadoSolicitudBaja.APROBADA]: "default",
    [EstadoSolicitudBaja.RECHAZADA]: "destructive",
  };

  const revisionAdministrativaLabels: Record<
    EstadoRevisionAdministrativa,
    string
  > = {
    [EstadoRevisionAdministrativa.PENDIENTE]: "Pendiente",
    [EstadoRevisionAdministrativa.CONFIRMADA]: "Sin deudas",
    [EstadoRevisionAdministrativa.DEUDAS_INFORMADAS]: "Deudas informadas",
  };

  const revisionAdministrativaVariant: Record<
    EstadoRevisionAdministrativa,
    "outline" | "default" | "destructive"
  > = {
    [EstadoRevisionAdministrativa.PENDIENTE]: "outline",
    [EstadoRevisionAdministrativa.CONFIRMADA]: "default",
    [EstadoRevisionAdministrativa.DEUDAS_INFORMADAS]: "destructive",
  };

  // helpers
  const toNombre = (p?: PersonaDTO | null) =>
    p
      ? `${p.apellido ?? ""}, ${p.nombre ?? ""}`.trim().replace(/^, /, "") ||
        "—"
      : "—";

  const seccionLabel = (sid?: number | null, mapOverride?: Map<number, SeccionDTO>) => {
    if (!sid) return "—";
    const sourceMap = mapOverride ?? seccionesMap;
    const s = sourceMap.get(sid);
    if (!s) return `Sección #${sid}`;
    const grado = (s as any).gradoSala ?? (s as any).grado ?? "";
    const div = (s as any).division ?? "";
    const turno = formatTurnoLabel((s as any).turno ?? "") ?? (s as any).turno ?? "";
    return `${grado} ${div} ${turno}`.trim();
  };

  const parseDateValue = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date;
  };

  const formatDate = (value?: string | null) => {
    if (!value) return null;
    const parsed = parseDateValue(value);
    if (!parsed) return value;
    return parsed.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatRange = (desde?: string | null, hasta?: string | null) => {
    const start = formatDate(desde);
    const end = formatDate(hasta);
    if (start && end) return `${start} – ${end}`;
    if (start && !end) return `${start} – Actualidad`;
    if (!start && end) return `Hasta ${end}`;
    return "Sin fechas registradas";
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return "—";
    const parsed = parseDateValue(value);
    if (!parsed) return value;
    return parsed.toLocaleString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeValue = (value?: string | null) => {
    const parsed = parseDateValue(value);
    return parsed ? parsed.getTime() : null;
  };

  const getMatriculaYear = (matricula: MatriculaDTO) => {
    const periodo =
      ((matricula as any)?.periodoEscolar ?? null) || (matricula as any)?.periodo;
    const yearValue =
      (periodo?.anio as number | undefined) ??
      (periodo?.year as number | undefined) ??
      ((matricula as any)?.anio as number | undefined);
    return yearValue ?? 0;
  };

  const NO_SECTION_VALUE = "__no-section__";

  const sectionOptions = useMemo(() => {
    if (!seccionesList.length) return [] as { id: string; label: string }[];
    return seccionesList
      .filter((section) => {
        const periodId =
          (section as any).periodoEscolarId ??
          (section as any).periodoId ??
          (section as any).periodoEscolar?.id ?? null;
        if (!activePeriodId) return true;
        if (!periodId) return true;
        return periodId === activePeriodId;
      })
      .map((section) => ({
        id: String(section.id),
        label: seccionLabel(section.id),
      }));
  }, [seccionesList, seccionesMap, activePeriodId]);
  const rolOptions = useMemo(() => Object.values(RolVinculo), []);
  const studentRoleOptions = useMemo(() => {
    const base = [UserRole.STUDENT, UserRole.FAMILY];
    const current = persona?.roles ?? [];
    return normalizeRoles([...base, ...current]);
  }, [persona?.roles]);
  const formatRol = (value?: RolVinculo | string | null) => {
    if (!value) return "Sin vínculo";
    const formatted = String(value).replace(/_/g, " ").toLowerCase();
    return formatted.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleOpenFamilyChat = (personaId?: number | null) => {
    if (!personaId) return;
    router.push(`/dashboard/chat?personaId=${personaId}`);
  };

  const [editOpen, setEditOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [personaDraft, setPersonaDraft] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    fechaNacimiento: "",
    genero: DEFAULT_GENERO_VALUE,
    nacionalidad: "",
    domicilio: "",
    celular: "",
    email: "",
  });
  const [alumnoDraft, setAlumnoDraft] = useState({
    fechaInscripcion: "",
    observacionesGenerales: "",
    motivoRechazoBaja: "",
  });
  const [aspiranteDraft, setAspiranteDraft] = useState<AspiranteComplementoForm>(
    emptyAspiranteComplemento,
  );
  const [selectedSeccionId, setSelectedSeccionId] = useState<string>("");
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const [credentialsForm, setCredentialsForm] = useState<CredentialsFormState>({
    email: "",
    password: "",
    confirmPassword: "",
    roles: [],
  });
  const [savingCredentials, setSavingCredentials] = useState(false);
  const [addFamilyOpen, setAddFamilyOpen] = useState(false);
  const [addPersonaDraft, setAddPersonaDraft] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    telefono: "",
    celular: "",
  });
  const [addLookupLoading, setAddLookupLoading] = useState(false);
  const [addLookupCompleted, setAddLookupCompleted] = useState(false);
  const [addPersonaId, setAddPersonaId] = useState<number | null>(null);
  const [addFamiliarId, setAddFamiliarId] = useState<number | null>(null);
  const [addRol, setAddRol] = useState<RolVinculo | "">("");
  const [addConvive, setAddConvive] = useState(false);
  const [savingFamily, setSavingFamily] = useState(false);
  const [familiaresCatalog, setFamiliaresCatalog] = useState<FamiliarDTO[]>([]);

  const addDniValue = formatDni(addPersonaDraft.dni);
  const addDniValid = addDniValue.length >= 7 && addDniValue.length <= 10;
  const addPersonaExists = Boolean(addPersonaId);
  const addPersonaReady =
    addPersonaExists ||
    (addDniValid && addLookupCompleted && !addLookupLoading);

  useEffect(() => {
    if (credentialsDialogOpen) {
      const fallbackRoles =
        persona?.roles && persona.roles.length > 0
          ? normalizeRoles(persona.roles)
          : [UserRole.STUDENT];
      setCredentialsForm({
        email: persona?.email ?? "",
        password: "",
        confirmPassword: "",
        roles: normalizeRoles(fallbackRoles),
      });
    }
  }, [credentialsDialogOpen, persona?.email, persona?.roles]);

  // carga
  useEffect(() => {
    if (!alumnoId || Number.isNaN(alumnoId)) return;
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) Alumno + Persona
        const alumnoResponse = await identidad.alumnos.byId(alumnoId);
        const a = alumnoResponse.data ?? null;
        if (!alive) return;
        if (!a) {
          setAlumno(null);
          setPersona(null);
          setError("No encontramos los datos del alumno");
          return;
        }
        setAlumno(a);

        let p: PersonaDTO | null = null;
        if (a.personaId) {
          try {
            p = (await identidad.personasCore.getById(a.personaId)).data ?? null;
          } catch (personaError) {
            logAlumnoError(
              personaError,
              "No se pudo obtener la persona del alumno",
            );
          }
          if (!p) {
            const fallbackPersona: PersonaDTO = {
              id: a.personaId,
              nombre: a.nombre ?? undefined,
              apellido: a.apellido ?? undefined,
              dni: a.dni ?? undefined,
            };
            p = fallbackPersona;
          }
        }
        if (!alive) return;
        setPersona(p);

        // 2) Secciones (para labels y periodo)
        let secciones: SeccionDTO[] = [];
        let seccionMapLocal: Map<number, SeccionDTO> | null = null;
        try {
          secciones = (await gestionAcademica.secciones.list()).data ?? [];
          const map = new Map<number, SeccionDTO>();
          secciones.forEach((s: any) => map.set(s.id, s));
          seccionMapLocal = map;
          if (!alive) return;
          setSeccionesMap(map);
          setSeccionesList(secciones);
        } catch (error) {
          logAlumnoError(error);
          seccionMapLocal = null;
          if (!alive) return;
          setSeccionesMap(new Map<number, SeccionDTO>());
          setSeccionesList([]);
        }

        // 3) Matrículas del alumno
        let mats: MatriculaDTO[] = [];
        try {
          const { data } = await vidaEscolar.matriculas.list();
          mats = ((data ?? []) as MatriculaDTO[]).filter(
            (m: any) => m.alumnoId === alumnoId,
          );
        } catch (error) {
          logAlumnoError(error);
          mats = [];
        }
        if (!alive) return;
        setMatriculas(mats);

        // 4) Historial de sección (todas las filas) y enriquecer con label
        let hist: HistorialVM[] = [];
        try {
          const { data } = await vidaEscolar.matriculaSeccionHistorial.list();
          const allHist = (data ?? []) as any[];
          const labelMap = seccionMapLocal ?? seccionesMap;
          const labelFor = (sid?: number | null) => seccionLabel(sid, labelMap);

          hist = allHist
            .filter((h) =>
              mats.some(
                (m: any) => m.id === (h.matriculaId ?? h.matricula?.id),
              ),
            )
            .map((h) => {
              const sid = h.seccionId ?? h.seccion?.id;
              return {
                id: h.id ?? h.matriculaSeccionHistorialId ?? 0,
                matriculaId: h.matriculaId ?? h.matricula?.id,
                seccionId: sid,
                desde: h.desde ?? h.vigenciaDesde ?? null,
                hasta: h.hasta ?? h.vigenciaHasta ?? null,
                seccionLabel: labelFor(sid),
              } as HistorialVM;
            });
        } catch (error) {
          logAlumnoError(error);
          hist = [];
        }
        if (!alive) return;
        setHistorial(hist);

        // 5) Familiares + sus personas + vínculo
        let fams: FamiliarConVinculo[] = [];
        try {
          const { data } = await identidad.alumnoFamiliares.list();
          const links = ((data ?? []) as any[]).filter(
            (af: any) => af.alumnoId === alumnoId,
          );
          const results = await Promise.allSettled(
            links.map(async (link: any) => {
              if (!link?.familiarId) return null;
              try {
                const familiarRes = await identidad.familiares.byId(link.familiarId);
                const f = familiarRes.data as FamiliarDTO | null;
                if (!f) return null;
                let fp: PersonaDTO | null = null;
                if (f.personaId) {
                  fp = await identidad.personasCore
                    .getById(f.personaId)
                    .then((r) => r.data ?? null)
                    .catch(() => null);
                }
                return {
                  ...f,
                  parentesco: link.rolVinculo ?? undefined,
                  rolVinculo: link.rolVinculo ?? null,
                  convive: Boolean(link.convive),
                  _persona: fp,
                } as FamiliarConVinculo;
              } catch (error) {
                logAlumnoError(error);
                return null;
              }
            }),
          );
          fams = results.reduce<FamiliarConVinculo[]>((acc, res) => {
            if (res.status === "fulfilled" && res.value) {
              acc.push(res.value);
            }
            return acc;
          }, []);
        } catch (error) {
          logAlumnoError(error);
          fams = [];
        }
        if (!alive) return;
        setFamiliares(fams);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "No se pudo cargar el perfil");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [alumnoId, reloadKey]);

  // sección actual = fila del historial con hasta == null (si hay varias matrículas, prioriza la más reciente)
  const seccionActual = useMemo(() => {
    const abiertas = historial.filter((h) => !h.hasta);
    if (!abiertas.length) return null;
    // Heurística: la más “nueva” por fecha 'desde'
    abiertas.sort((a, b) =>
      String(b.desde ?? "").localeCompare(String(a.desde ?? "")),
    );
    return abiertas[0];
  }, [historial]);

  const matriculaActual = useMemo(() => {
    if (!activePeriodId) return null;
    return (
      matriculas.find((m) => {
        const periodId =
          m.periodoEscolarId ??
          (m as any).periodoId ??
          (m as any).periodoEscolar?.id ??
          null;
        return periodId === activePeriodId;
      }) ?? null
    );
  }, [matriculas, activePeriodId]);

  const matriculaIds = useMemo(
    () =>
      matriculas
        .map((m) => m.id)
        .filter((id): id is number => typeof id === "number" && !Number.isNaN(id)),
    [matriculas],
  );

  const matriculasConHistorial = useMemo(
    () =>
      [...matriculas]
        .sort((a, b) => {
          const yearDiff = getMatriculaYear(b) - getMatriculaYear(a);
          if (yearDiff !== 0) return yearDiff;
          return (b.id ?? 0) - (a.id ?? 0);
        })
        .map((matricula) => ({
          matricula,
          filas: historial
            .filter((h) => h.matriculaId === matricula.id)
            .slice()
            .sort((a, b) => {
              const aStart = getTimeValue(a.desde) ?? Number.NEGATIVE_INFINITY;
              const bStart = getTimeValue(b.desde) ?? Number.NEGATIVE_INFINITY;
              if (aStart !== bStart) return bStart - aStart;
              const aEnd = getTimeValue(a.hasta) ?? Number.NEGATIVE_INFINITY;
              const bEnd = getTimeValue(b.hasta) ?? Number.NEGATIVE_INFINITY;
              return bEnd - aEnd;
            }),
        })),
    [matriculas, historial],
  );

  const fetchSolicitudesBaja = useCallback(async () => {
    if (!canManageProfile) return;
    if (matriculaIds.length === 0) {
      setSolicitudesBaja([]);
      return;
    }
    setLoadingSolicitudesBaja(true);
    setSolicitudesBajaError(null);
    try {
      const safeAlumnoId = Number.isFinite(alumnoId) ? alumnoId : undefined;
      const params = safeAlumnoId ? { alumnoId: safeAlumnoId } : undefined;
      const { data } = await vidaEscolar.solicitudesBaja.list(params);
      const all = (data ?? []) as SolicitudBajaAlumnoDTO[];
      const filtered = all.filter((sol) => {
        const id = sol.matriculaId ?? null;
        return typeof id === "number" && matriculaIds.includes(id);
      });
      setSolicitudesBaja(filtered);
    } catch (error) {
      logAlumnoError(error, "No se pudieron obtener las solicitudes de baja");
      setSolicitudesBajaError(
        "No se pudieron obtener las solicitudes de baja",
      );
    } finally {
      setLoadingSolicitudesBaja(false);
    }
  }, [alumnoId, canManageProfile, matriculaIds]);

  useEffect(() => {
    if (!canManageProfile) {
      setSolicitudesBaja([]);
      setSolicitudesBajaError(null);
      setLoadingSolicitudesBaja(false);
      return;
    }
    if (matriculaIds.length === 0) {
      setSolicitudesBaja([]);
      setSolicitudesBajaError(null);
      return;
    }
    fetchSolicitudesBaja();
  }, [canManageProfile, matriculaIds, fetchSolicitudesBaja]);

  const pendingSolicitud = useMemo(() => {
    if (!matriculaActual?.id) return null;
    return (
      solicitudesBaja.find(
        (sol) =>
          (sol.matriculaId ?? null) === matriculaActual.id &&
          sol.estado === EstadoSolicitudBaja.PENDIENTE,
      ) ?? null
    );
  }, [matriculaActual, solicitudesBaja]);

  const pendingSolicitudRevisionEstado = pendingSolicitud
    ? pendingSolicitud.estadoRevisionAdministrativa ??
      EstadoRevisionAdministrativa.PENDIENTE
    : null;

  const pendingSolicitudTooltip = useMemo(() => {
    if (!pendingSolicitud) return null;
    const detalle = pendingSolicitud.observacionRevisionAdministrativa?.trim();
    const estado =
      pendingSolicitudRevisionEstado ?? EstadoRevisionAdministrativa.PENDIENTE;
    if (estado === EstadoRevisionAdministrativa.PENDIENTE) {
      return "Hay una solicitud de baja pendiente a la espera de revisión administrativa.";
    }
    if (estado === EstadoRevisionAdministrativa.CONFIRMADA) {
      return "Administración confirmó la revisión. Dirección debe decidir si acepta o rechaza la baja.";
    }
    return `Administración informó deudas pendientes.${
      detalle ? ` Detalle: ${detalle}` : ""
    }`;
  }, [pendingSolicitud, pendingSolicitudRevisionEstado]);

  const pendingSolicitudBadgeClass = useMemo(() => {
    if (!pendingSolicitudRevisionEstado) {
      return "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100";
    }
    switch (pendingSolicitudRevisionEstado) {
      case EstadoRevisionAdministrativa.CONFIRMADA:
        return "border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100";
      case EstadoRevisionAdministrativa.DEUDAS_INFORMADAS:
        return "border-red-300 bg-red-50 text-red-900 hover:bg-red-100";
      default:
        return "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100";
    }
  }, [pendingSolicitudRevisionEstado]);

  const resetCrearBajaForm = useCallback(() => {
    setCrearBajaMotivo("");
    setCrearBajaLoading(false);
    setSolicitudesBajaError(null);
  }, []);

  const handleCrearBajaOpenChange = useCallback(
    (open: boolean) => {
      setCrearBajaOpen(open);
      if (open) {
        fetchSolicitudesBaja();
        return;
      }
      resetCrearBajaForm();
    },
    [fetchSolicitudesBaja, resetCrearBajaForm],
  );

  const handleCrearBaja = useCallback(async () => {
    if (!matriculaActual?.id) {
      toast.error("El alumno no tiene una matrícula activa para registrar la baja");
      return;
    }
    if (pendingSolicitud) {
      toast.error(
        "Ya existe una solicitud de baja pendiente para esta matrícula",
      );
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
        matriculaId: matriculaActual.id,
        motivo,
      });
      toast.success("Solicitud de baja registrada correctamente");
      resetCrearBajaForm();
      setCrearBajaOpen(false);
      await fetchSolicitudesBaja();
      setReloadKey((prev) => prev + 1);
    } catch (error) {
      logAlumnoError(error, "No se pudo registrar la solicitud de baja");
      toast.error("No se pudo registrar la solicitud de baja");
    } finally {
      setCrearBajaLoading(false);
    }
  }, [
    crearBajaMotivo,
    fetchSolicitudesBaja,
    matriculaActual,
    pendingSolicitud,
    resetCrearBajaForm,
  ]);

  const validateDecision = useCallback(
    (
      sol: SolicitudBajaAlumnoDTO,
      type: "approve" | "reject",
      showToast = true,
    ) => {
      const revisionMessage =
        type === "approve"
          ? "Administración debe completar la revisión antes de aceptar la baja"
          : "Administración debe completar la revisión antes de rechazar la baja";
      const personaMessage =
        type === "approve"
          ? "No pudimos identificar a la persona que acepta la baja"
          : "No pudimos identificar a la persona que rechaza la baja";
      if (
        (sol.estadoRevisionAdministrativa ??
          EstadoRevisionAdministrativa.PENDIENTE) ===
        EstadoRevisionAdministrativa.PENDIENTE
      ) {
        if (showToast) {
          toast.error(revisionMessage);
        }
        return false;
      }
      if (!personaActualId) {
        if (showToast) {
          toast.error(personaMessage);
        }
        return false;
      }
      return true;
    },
    [personaActualId],
  );

  const handleAceptarSolicitud = useCallback(
    async (sol: SolicitudBajaAlumnoDTO) => {
      if (!validateDecision(sol, "approve", false)) {
        validateDecision(sol, "approve", true);
        setApproveDialogSolicitud(null);
        return;
      }

      const solicitudId = sol.id;
      if (solicitudId == null) {
        toast.error("No se pudo identificar la solicitud de baja");
        setApproveDialogSolicitud(null);
        return;
      }

      const personaId = personaActualId;
      if (personaId == null) {
        validateDecision(sol, "approve", true);
        setApproveDialogSolicitud(null);
        return;
      }

      setProcessingDecisionSolicitudId(solicitudId);
      try {
        await vidaEscolar.solicitudesBaja.approve(solicitudId, {
          decididoPorPersonaId: personaId,
        });
        toast.success("Baja aceptada correctamente");
        await fetchSolicitudesBaja();
        setReloadKey((prev) => prev + 1);
      } catch (error) {
        logAlumnoError(error, "No se pudo aceptar la baja");
        toast.error("No se pudo aceptar la baja");
      } finally {
        setProcessingDecisionSolicitudId(null);
        setApproveDialogSolicitud(null);
      }
    },
    [
      validateDecision,
      personaActualId,
      fetchSolicitudesBaja,
      setReloadKey,
    ],
  );

  const handleRechazarSolicitud = useCallback(
    async (sol: SolicitudBajaAlumnoDTO, reason: string) => {
      if (!validateDecision(sol, "reject", false)) {
        validateDecision(sol, "reject", true);
        setRejectDialogSolicitud(null);
        return;
      }

      const normalized = reason.trim();
      if (!normalized) {
        toast.error("El motivo de rechazo es obligatorio");
        return;
      }

      const solicitudId = sol.id;
      if (solicitudId == null) {
        toast.error("No se pudo identificar la solicitud de baja");
        setRejectDialogSolicitud(null);
        return;
      }

      const personaId = personaActualId;
      if (personaId == null) {
        validateDecision(sol, "reject", true);
        setRejectDialogSolicitud(null);
        return;
      }

      setProcessingDecisionSolicitudId(solicitudId);
      try {
        await vidaEscolar.solicitudesBaja.reject(solicitudId, {
          decididoPorPersonaId: personaId,
          motivoRechazo: normalized,
        });
        toast.success("Solicitud rechazada");
        await fetchSolicitudesBaja();
        setReloadKey((prev) => prev + 1);
      } catch (error) {
        logAlumnoError(error, "No se pudo rechazar la baja");
        toast.error("No se pudo rechazar la baja");
      } finally {
        setProcessingDecisionSolicitudId(null);
        setRejectDialogSolicitud(null);
        setRejectMotivo("");
      }
    },
    [
      validateDecision,
      personaActualId,
      fetchSolicitudesBaja,
      setReloadKey,
    ],
  );

  const requestAceptarSolicitud = useCallback(
    (sol: SolicitudBajaAlumnoDTO) => {
      if (!validateDecision(sol, "approve")) return;
      setApproveDialogSolicitud(sol);
    },
    [validateDecision],
  );

  const requestRechazarSolicitud = useCallback(
    (sol: SolicitudBajaAlumnoDTO) => {
      if (!validateDecision(sol, "reject")) return;
      setRejectMotivo(sol.motivoRechazo?.trim() ?? "");
      setRejectDialogSolicitud(sol);
    },
    [validateDecision],
  );

  const getSolicitudAlumnoNombre = useCallback(
    (sol?: SolicitudBajaAlumnoDTO | null) => {
      if (!sol) return "Alumno sin datos";
      const nombre = [sol.alumnoApellido, sol.alumnoNombre]
        .filter(Boolean)
        .join(", ")
        .trim();
      return nombre || "Alumno sin datos";
    },
    [],
  );

  useEffect(() => {
    if (!editOpen) return;
    setPersonaDraft({
      nombre: persona?.nombre ?? "",
      apellido: persona?.apellido ?? "",
      dni: formatDni(persona?.dni ?? ""),
      fechaNacimiento: persona?.fechaNacimiento ?? "",
      genero: normalizeGenero(persona?.genero) || DEFAULT_GENERO_VALUE,
      nacionalidad: persona?.nacionalidad ?? "",
      domicilio: persona?.domicilio ?? "",
      celular: persona?.celular ? onlyDigits(persona.celular) : "",
      email: persona?.email ?? "",
    });
    setAlumnoDraft({
      fechaInscripcion: alumno?.fechaInscripcion ?? "",
      observacionesGenerales: alumno?.observacionesGenerales ?? "",
      motivoRechazoBaja: alumno?.motivoRechazoBaja ?? "",
    });
    setAspiranteDraft({
      conectividadInternet: alumno?.conectividadInternet ?? "",
      dispositivosDisponibles: alumno?.dispositivosDisponibles ?? "",
      idiomasHabladosHogar: alumno?.idiomasHabladosHogar ?? "",
      enfermedadesAlergias: alumno?.enfermedadesAlergias ?? "",
      medicacionHabitual: alumno?.medicacionHabitual ?? "",
      limitacionesFisicasNeurologicas: alumno?.limitacionesFisicas ?? "",
      tratamientosTerapeuticos: alumno?.tratamientosTerapeuticos ?? "",
      usoAyudasMovilidad: Boolean(alumno?.usoAyudasMovilidad ?? false),
      coberturaMedica: alumno?.coberturaMedica ?? "",
      observacionesAdicionalesSalud: alumno?.observacionesSalud ?? "",
    });
    const currentSectionId = seccionActual?.seccionId
      ? String(seccionActual.seccionId)
      : "";
    if (
      currentSectionId &&
      !sectionOptions.some((option) => option.id === currentSectionId)
    ) {
      setSelectedSeccionId("");
    } else {
      setSelectedSeccionId(currentSectionId);
    }
  }, [editOpen, persona, alumno, seccionActual, sectionOptions]);

  useEffect(() => {
    if (!editOpen) return;
    if (!selectedSeccionId) return;
    if (sectionOptions.some((option) => option.id === selectedSeccionId)) return;
    setSelectedSeccionId("");
  }, [editOpen, sectionOptions, selectedSeccionId]);

  const postulacionAdapter = useMemo(() => {
    return {
      ...aspiranteDraft,
      familiares: [],
    } as PostulacionFormData;
  }, [aspiranteDraft]);

  const handleAspiranteFieldChange = useCallback(
    (field: string, value: any) => {
      setAspiranteDraft((prev) => {
        if (field === "usoAyudasMovilidad") {
          return { ...prev, usoAyudasMovilidad: Boolean(value) };
        }
        return {
          ...prev,
          [field]: value ?? "",
        } as AspiranteComplementoForm;
      });
    },
    [],
  );

  useEffect(() => {
    if (!addFamilyOpen) return;
    let alive = true;
    setAddPersonaDraft({
      nombre: "",
      apellido: "",
      dni: "",
      email: "",
      telefono: "",
      celular: "",
    });
    setAddPersonaId(null);
    setAddFamiliarId(null);
    setAddRol("");
    setAddConvive(false);
    setAddLookupLoading(false);
    setAddLookupCompleted(false);
    setSavingFamily(false);
    (async () => {
      try {
        const { data } = await identidad.familiares.list();
        if (!alive) return;
        setFamiliaresCatalog(data ?? []);
      } catch (error) {
        logAlumnoError(error);
        if (!alive) return;
        setFamiliaresCatalog([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [addFamilyOpen]);

  useEffect(() => {
    if (!addFamilyOpen) return;
    const dni = formatDni(addPersonaDraft.dni);
    if (dni.length < 7 || dni.length > 10) {
      setAddPersonaId(null);
      setAddFamiliarId(null);
      setAddLookupLoading(false);
      setAddLookupCompleted(false);
      return;
    }
    setAddLookupLoading(true);
    setAddLookupCompleted(false);
    let alive = true;
    const handler = setTimeout(async () => {
      try {
        const { data: personaId } = await identidad.personasCore.findIdByDni(dni);
        if (!alive) return;
        if (personaId) {
          const personaData = await identidad.personasCore
            .getById(personaId)
            .then((r) => r.data ?? null)
            .catch(() => null);
          if (!alive) return;
          if (personaData) {
            setAddPersonaDraft((prev) => ({
              ...prev,
              nombre: personaData.nombre ?? "",
              apellido: personaData.apellido ?? "",
              dni: formatDni(personaData.dni ?? dni),
              email: personaData.email ?? "",
              telefono: personaData.telefono
                ? onlyDigits(personaData.telefono)
                : "",
              celular: personaData.celular
                ? onlyDigits(personaData.celular)
                : "",
            }));
          }
          setAddPersonaId(Number(personaId));
          const famExisting =
            familiaresCatalog.find((f) => f.personaId === Number(personaId)) ??
            null;
          setAddFamiliarId(famExisting ? famExisting.id : null);
        } else {
          setAddPersonaId(null);
          setAddFamiliarId(null);
        }
      } catch (error: any) {
        if (!alive) return;
        if (error?.response?.status === 404) {
          setAddPersonaId(null);
          setAddFamiliarId(null);
        } else {
          logAlumnoError(error);
          setAddPersonaId(null);
          setAddFamiliarId(null);
        }
      } finally {
        if (!alive) return;
        setAddLookupLoading(false);
        setAddLookupCompleted(true);
      }
    }, 400);
    return () => {
      alive = false;
      clearTimeout(handler);
    };
  }, [addFamilyOpen, addPersonaDraft.dni, familiaresCatalog]);
  const handleSaveProfile = async () => {
    if (!alumno) return;

    if (!personaDraft.nombre.trim() || !personaDraft.apellido.trim()) {
      toast.error("Completá nombre y apellido del alumno");
      return;
    }

    const dniValue = formatDni(personaDraft.dni);
    if (!dniValue || dniValue.length < 7 || dniValue.length > 10) {
      toast.error("Ingresá un DNI válido (7 a 10 dígitos).");
      return;
    }

    if (
      personaDraft.fechaNacimiento &&
      !isBirthDateValid(personaDraft.fechaNacimiento)
    ) {
      toast.error(
        "La fecha de nacimiento debe ser al menos dos años anterior a hoy.",
      );
      return;
    }

    if (!aspiranteDraft.conectividadInternet?.trim()) {
      toast.error("Completá la conectividad del hogar");
      return;
    }

    if (!aspiranteDraft.dispositivosDisponibles?.trim()) {
      toast.error("Indicá los dispositivos disponibles");
      return;
    }

    if (!aspiranteDraft.idiomasHabladosHogar?.trim()) {
      toast.error("Completá los idiomas hablados en el hogar");
      return;
    }

    setSavingProfile(true);
    const todayIso = new Date().toISOString().slice(0, 10);

    try {
      const personaBasePayload = {
        nombre: personaDraft.nombre.trim(),
        apellido: personaDraft.apellido.trim(),
        dni: dniValue,
        fechaNacimiento: personaDraft.fechaNacimiento || undefined,
        genero: personaDraft.genero || undefined,
        nacionalidad: personaDraft.nacionalidad || undefined,
        domicilio: personaDraft.domicilio || undefined,
        celular: onlyDigits(personaDraft.celular) || undefined,
        email: personaDraft.email || undefined,
      };
      const personaUpdatePayload: PersonaUpdateDTO = {
        ...personaBasePayload,
      };
      const personaCreatePayload: PersonaCreateDTO = {
        ...personaBasePayload,
      };

      const resolvePersonaId = async (): Promise<number | null> => {
        let currentId = persona?.id ?? alumno.personaId ?? null;

        if (currentId) {
          try {
            await identidad.personasCore.update(currentId, personaUpdatePayload);
            return currentId;
          } catch (error: any) {
            if (error?.response?.status !== 404) {
              throw error;
            }
            currentId = null;
          }
        }

        if (!currentId) {
          let existingId: number | null = null;
          try {
            const { data: personaFoundId } = await identidad.personasCore.findIdByDni(
              dniValue,
            );
            if (personaFoundId) {
              existingId = Number(personaFoundId);
            }
          } catch (lookupError: any) {
            if (
              lookupError?.response?.status &&
              lookupError.response.status !== 404
            ) {
              throw lookupError;
            }
          }

          if (existingId) {
            await identidad.personasCore.update(existingId, personaUpdatePayload);
            return existingId;
          }

          const { data: personaCreated } = await identidad.personasCore.create(
            personaCreatePayload,
          );
          return Number(personaCreated);
        }

        return currentId;
      };

      const personaId = await resolvePersonaId();

      if (!personaId) {
        throw new Error("No pudimos registrar los datos personales del alumno");
      }

      if (alumno.id) {
        await identidad.alumnos.update(alumno.id, {
          id: alumno.id,
          personaId,
          fechaInscripcion: alumnoDraft.fechaInscripcion || undefined,
          observacionesGenerales:
            alumnoDraft.observacionesGenerales?.trim() || undefined,
          motivoRechazoBaja:
            alumnoDraft.motivoRechazoBaja?.trim() || undefined,
          conectividadInternet:
            aspiranteDraft.conectividadInternet?.trim() || undefined,
          dispositivosDisponibles:
            aspiranteDraft.dispositivosDisponibles?.trim() || undefined,
          idiomasHabladosHogar:
            aspiranteDraft.idiomasHabladosHogar?.trim() || undefined,
          enfermedadesAlergias:
            aspiranteDraft.enfermedadesAlergias?.trim() || undefined,
          medicacionHabitual:
            aspiranteDraft.medicacionHabitual?.trim() || undefined,
          limitacionesFisicas:
            aspiranteDraft.limitacionesFisicasNeurologicas?.trim() || undefined,
          tratamientosTerapeuticos:
            aspiranteDraft.tratamientosTerapeuticos?.trim() || undefined,
          usoAyudasMovilidad:
            aspiranteDraft.usoAyudasMovilidad ?? undefined,
          coberturaMedica: aspiranteDraft.coberturaMedica?.trim() || undefined,
          observacionesSalud:
            aspiranteDraft.observacionesAdicionalesSalud?.trim() || undefined,
        });
      }

      const targetSeccionId = selectedSeccionId
        ? Number(selectedSeccionId)
        : null;

      let matricula = matriculaActual ?? null;
      if (!matricula && seccionActual?.matriculaId) {
        matricula =
          matriculas.find((m) => m.id === seccionActual.matriculaId) ?? null;
      }

      if (!matricula && targetSeccionId && activePeriodId) {
        const { data: newMatriculaId } = await vidaEscolar.matriculas.create({
          alumnoId,
          periodoEscolarId: activePeriodId,
        });
        const createdId = Number(newMatriculaId);
        matricula = {
          id: createdId,
          alumnoId,
          periodoEscolarId: activePeriodId,
        } as MatriculaDTO;
      } else if (!matricula && targetSeccionId && !activePeriodId) {
        throw new Error(
          "No encontramos un período escolar activo para asignar la sección.",
        );
      }

      if (matricula) {
        const entries = historial
          .filter((h) => h.matriculaId === matricula.id)
          .sort((a, b) =>
            String(b.desde ?? "").localeCompare(String(a.desde ?? "")),
          );
        const currentEntry = entries.find((entry) => !entry.hasta) ?? null;

        if (
          currentEntry &&
          (targetSeccionId === null ||
            currentEntry.seccionId !== targetSeccionId)
        ) {
          const desdeValue = currentEntry.desde ?? todayIso;
          await vidaEscolar.matriculaSeccionHistorial.update(currentEntry.id, {
            id: currentEntry.id,
            matriculaId: currentEntry.matriculaId,
            seccionId: currentEntry.seccionId,
            desde: desdeValue,
            hasta: todayIso,
          } as MatriculaSeccionHistorialDTO);
        }

        if (
          targetSeccionId &&
          (!currentEntry || currentEntry.seccionId !== targetSeccionId)
        ) {
          await vidaEscolar.matriculaSeccionHistorial.create({
            matriculaId: matricula.id,
            seccionId: targetSeccionId,
            desde: todayIso,
          });
        }
      }

      setPersona((prev) => {
        const base: Partial<PersonaDTO> = prev ? { ...prev } : {};
        const next: PersonaDTO = {
          ...base,
          id: personaId,
          nombre: personaBasePayload.nombre,
          apellido: personaBasePayload.apellido,
          dni: personaBasePayload.dni,
          fechaNacimiento: personaDraft.fechaNacimiento || undefined,
          genero: personaDraft.genero || undefined,
          nacionalidad: personaBasePayload.nacionalidad,
          domicilio: personaBasePayload.domicilio,
          celular: personaBasePayload.celular,
          email: personaBasePayload.email,
        } as PersonaDTO;
        return next;
      });
      setAlumno((prev) =>
        prev
          ? {
              ...prev,
              personaId,
              fechaInscripcion: alumnoDraft.fechaInscripcion || undefined,
              observacionesGenerales:
                alumnoDraft.observacionesGenerales?.trim() || undefined,
              motivoRechazoBaja:
                alumnoDraft.motivoRechazoBaja?.trim() || undefined,
              conectividadInternet:
                aspiranteDraft.conectividadInternet?.trim() || undefined,
              dispositivosDisponibles:
                aspiranteDraft.dispositivosDisponibles?.trim() || undefined,
              idiomasHabladosHogar:
                aspiranteDraft.idiomasHabladosHogar?.trim() || undefined,
              enfermedadesAlergias:
                aspiranteDraft.enfermedadesAlergias?.trim() || undefined,
              medicacionHabitual:
                aspiranteDraft.medicacionHabitual?.trim() || undefined,
              limitacionesFisicas:
                aspiranteDraft.limitacionesFisicasNeurologicas?.trim() || undefined,
              tratamientosTerapeuticos:
                aspiranteDraft.tratamientosTerapeuticos?.trim() || undefined,
              usoAyudasMovilidad: aspiranteDraft.usoAyudasMovilidad ?? undefined,
              coberturaMedica:
                aspiranteDraft.coberturaMedica?.trim() || undefined,
              observacionesSalud:
                aspiranteDraft.observacionesAdicionalesSalud?.trim() || undefined,
            }
          : prev,
      );

      toast.success("Perfil actualizado correctamente");
      setEditOpen(false);
      setReloadKey((value) => value + 1);
    } catch (error: any) {
      logAlumnoError(error);
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "No pudimos actualizar el alumno",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveCredentials = async () => {
    if (!persona?.id) {
      toast.error("No encontramos la persona vinculada al alumno");
      return;
    }

    const email = credentialsForm.email.trim();
    const password = credentialsForm.password.trim();
    const confirmPassword = credentialsForm.confirmPassword.trim();

    if (!email) {
      toast.error("Ingresá un email válido para el acceso");
      return;
    }

    if (!persona.credencialesActivas && !password) {
      toast.error("Definí una contraseña inicial");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    const baseRoles = canEditRoles
      ? credentialsForm.roles
      : persona.roles && persona.roles.length > 0
        ? persona.roles
        : [UserRole.STUDENT];

    const normalizedSelected = normalizeRoles(baseRoles);

    if (!normalizedSelected.length) {
      toast.error("Seleccioná al menos un rol para el acceso");
      return;
    }

    const payload: Partial<PersonaUpdateDTO> = {
      email,
      roles: normalizedSelected,
    };

    if (password) {
      payload.password = password;
    }

    setSavingCredentials(true);
    try {
      await identidad.personasCore.update(persona.id, payload);
      const { data: refreshed } = await identidad.personasCore.getById(persona.id);
      setPersona(refreshed ?? null);
      toast.success("Acceso del alumno actualizado");
      setCredentialsDialogOpen(false);
      setCredentialsForm({
        email: email,
        password: "",
        confirmPassword: "",
        roles: normalizeRoles(
          refreshed?.roles && refreshed.roles.length > 0
            ? refreshed.roles
            : normalizedSelected,
        ),
      });
    } catch (error: any) {
      logAlumnoError(error);
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "No pudimos actualizar el acceso del alumno",
      );
    } finally {
      setSavingCredentials(false);
    }
  };

  const handleDisableCredentials = async () => {
    if (!persona?.id) {
      toast.error("No encontramos la persona vinculada al alumno");
      return;
    }

    setSavingCredentials(true);
    try {
      await identidad.personasCore.disableCredentials(persona.id);
      const { data: refreshed } = await identidad.personasCore.getById(persona.id);
      setPersona(refreshed ?? null);
      toast.success("Acceso del alumno desactivado");
      setCredentialsForm({
        email: refreshed?.email ?? "",
        password: "",
        confirmPassword: "",
        roles: normalizeRoles(refreshed?.roles ?? []),
      });
    } catch (error: any) {
      logAlumnoError(error);
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "No pudimos desactivar el acceso del alumno",
      );
    } finally {
      setSavingCredentials(false);
    }
  };

  const handleSaveFamily = async () => {
    if (!alumno) return;

    const addDniValue = formatDni(addPersonaDraft.dni);
    if (!addPersonaReady) {
      toast.error("Buscá un DNI válido del familiar antes de continuar");
      return;
    }

    if (!addDniValue || addDniValue.length < 7 || addDniValue.length > 10) {
      toast.error("Ingresá un DNI válido para el familiar");
      return;
    }

    if (
      !addPersonaId &&
      (!addPersonaDraft.nombre.trim() || !addPersonaDraft.apellido.trim())
    ) {
      toast.error("Completá nombre y apellido del familiar");
      return;
    }

    if (!addRol) {
      toast.error("Seleccioná el rol del familiar");
      return;
    }

    if (addFamiliarId && familiares.some((f) => f.id === addFamiliarId)) {
      toast.error("El familiar ya está vinculado a este alumno");
      return;
    }

    setSavingFamily(true);
    try {
      let personaId = addPersonaId;
      const personaPayload = {
        nombre: addPersonaDraft.nombre.trim(),
        apellido: addPersonaDraft.apellido.trim(),
        dni: addDniValue,
        email: addPersonaDraft.email.trim() || undefined,
        telefono: onlyDigits(addPersonaDraft.telefono) || undefined,
        celular: onlyDigits(addPersonaDraft.celular) || undefined,
      };

      if (personaId) {
        await identidad.personasCore.update(personaId, personaPayload);
      } else {
        const { data: personaCreated } = await identidad.personasCore.create(
          personaPayload,
        );
        personaId = Number(personaCreated);
      }

      if (!personaId) {
        throw new Error("No pudimos registrar los datos del familiar");
      }

      let familiarId = addFamiliarId;
      if (familiarId) {
        await identidad.familiares.update(
          familiarId,
          { id: familiarId, personaId } as any,
        );
      } else {
        const { data: familiarCreated } = await identidad.familiares.create({
          personaId,
        } as any);
        familiarId = Number(familiarCreated);
      }

      if (!familiarId) {
        throw new Error("No pudimos generar el vínculo del familiar");
      }

      await identidad.alumnoFamiliares.create({
        alumnoId,
        familiarId,
        rolVinculo: addRol,
        convive: addConvive,
      } as any);

      toast.success("Familiar agregado correctamente");
      setAddFamilyOpen(false);
      setReloadKey((value) => value + 1);
    } catch (error: any) {
      logAlumnoError(error);
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "No pudimos agregar al familiar",
      );
    } finally {
      setSavingFamily(false);
    }
  };


  return (
    <div className="p-4 md:p-8 space-y-6">
        <BackButton />
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Perfil del Alumno
            </h2>
            <div className="text-muted-foreground">
              ID: {alumnoId}
              {seccionActual && (
                <>
                  {" "}
                  • Sección actual:{" "}
                  <Badge variant="secondary">
                    {seccionLabel(seccionActual.seccionId)}
                  </Badge>
                </>
              )}
              {pendingSolicitud && (
                <>
                  {" "}
                  •{" "}
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className={pendingSolicitudBadgeClass}>
                          Baja pendiente
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs text-xs leading-relaxed">
                        {pendingSolicitudTooltip ??
                          "Hay una solicitud de baja pendiente a la espera de revisión administrativa."}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
            </div>
          </div>
          {canManageProfile && (
            <TooltipProvider delayDuration={200}>
              <div className="flex items-center gap-2">
                <Dialog
                  open={crearBajaOpen}
                  onOpenChange={handleCrearBajaOpenChange}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild>
                        <Button variant="destructive">
                          <UserMinus className="mr-2 h-4 w-4" /> Solicitar baja
                        </Button>
                      </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="max-w-xs text-xs leading-relaxed"
                    >
                      Dirección inicia desde aquí el circuito de baja y
                      Administración recibe la solicitud para auditar deudas
                      antes de confirmarla.
                    </TooltipContent>
                  </Tooltip>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Solicitar baja del alumno</DialogTitle>
                      <DialogDescription>
                        Registrá la solicitud y notificaremos a Administración
                        para que complete el circuito de baja.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Matrícula activa</Label>
                        {matriculaActual ? (
                          <div className="flex flex-wrap items-center gap-2 rounded-md border border-border/60 p-3 text-xs text-muted-foreground">
                            <Badge variant="outline">#{matriculaActual.id}</Badge>
                            {seccionActual?.seccionId && (
                              <span>{seccionLabel(seccionActual.seccionId)}</span>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            El alumno no tiene una matrícula activa en el período
                            escolar vigente.
                          </p>
                        )}
                      </div>
                      {loadingSolicitudesBaja && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Buscando solicitudes de baja existentes…
                        </div>
                      )}
                      {solicitudesBajaError && (
                        <p className="text-sm text-destructive">
                          {solicitudesBajaError}
                        </p>
                      )}
                      {pendingSolicitud && (
                        <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                          <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                          <div>
                            Ya existe una solicitud pendiente (#{pendingSolicitud.id})
                            para esta matrícula. Dirección debe aguardar la
                            respuesta de Administración antes de enviar una nueva.
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="crear-baja-motivo">Motivo</Label>
                        <Textarea
                          id="crear-baja-motivo"
                          placeholder="Ingresá el motivo de la baja"
                          value={crearBajaMotivo}
                          onChange={(event) => setCrearBajaMotivo(event.target.value)}
                          rows={4}
                          disabled={
                            crearBajaLoading ||
                            !matriculaActual?.id ||
                            loadingSolicitudesBaja
                          }
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
                          !matriculaActual?.id ||
                          pendingSolicitud != null ||
                          loadingSolicitudesBaja
                        }
                      >
                        {crearBajaLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registrando…
                          </>
                        ) : (
                          "Registrar baja"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default">Editar datos</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto sm:max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>Editar perfil del alumno</DialogTitle>
                    <DialogDescription>
                      Actualizá la información personal, académica y la asignación de sección del periodo vigente.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground">
                        Datos personales
                      </h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Nombre</Label>
                        <Input
                          value={personaDraft.nombre}
                          onChange={(e) =>
                            setPersonaDraft((prev) => ({
                              ...prev,
                              nombre: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Apellido</Label>
                        <Input
                          value={personaDraft.apellido}
                          onChange={(e) =>
                            setPersonaDraft((prev) => ({
                              ...prev,
                              apellido: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>DNI</Label>
                        <Input
                          value={personaDraft.dni}
                          onChange={(e) =>
                            setPersonaDraft((prev) => ({
                              ...prev,
                              dni: formatDni(e.target.value),
                            }))
                          }
                          inputMode="numeric"
                          pattern="\d*"
                          minLength={7}
                          maxLength={10}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fecha de nacimiento</Label>
                        <DatePicker
                          max={maxBirthDate}
                          value={personaDraft.fechaNacimiento || undefined}
                          onChange={(value) =>
                            setPersonaDraft((prev) => ({
                              ...prev,
                              fechaNacimiento: value ?? "",
                            }))
                          }
                          required
                          showMonthDropdown
                          showYearDropdown
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Género</Label>
                        <Select
                          value={personaDraft.genero || undefined}
                          onValueChange={(value) =>
                            setPersonaDraft((prev) => ({
                              ...prev,
                              genero: value,
                            }))
                          }
                        >
                          <SelectTrigger aria-required="true">
                            <SelectValue placeholder="Seleccioná el género" />
                          </SelectTrigger>
                          <SelectContent>
                            {GENERO_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Nacionalidad</Label>
                        <Input
                          value={personaDraft.nacionalidad}
                          onChange={(e) =>
                            setPersonaDraft((prev) => ({
                              ...prev,
                              nacionalidad: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Celular</Label>
                        <Input
                          type="tel"
                          inputMode="numeric"
                          pattern="\\d*"
                          value={personaDraft.celular}
                          onChange={(e) =>
                            setPersonaDraft((prev) => ({
                              ...prev,
                              celular: onlyDigits(e.target.value),
                            }))
                          }
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label>Domicilio</Label>
                        <Input
                          value={personaDraft.domicilio}
                          onChange={(e) =>
                            setPersonaDraft((prev) => ({
                              ...prev,
                              domicilio: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={personaDraft.email}
                          onChange={(e) =>
                            setPersonaDraft((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Información académica
                    </h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Fecha de inscripción</Label>
                        <DatePicker
                          value={alumnoDraft.fechaInscripcion || undefined}
                          onChange={(value) =>
                            setAlumnoDraft((prev) => ({
                              ...prev,
                              fechaInscripcion: value ?? "",
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Sección (periodo actual)</Label>
                        <Select
                          value={
                            selectedSeccionId ? selectedSeccionId : NO_SECTION_VALUE
                          }
                          onValueChange={(value) =>
                            setSelectedSeccionId(
                              value === NO_SECTION_VALUE ? "" : value
                            )
                          }
                          disabled={!sectionOptions.length}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sin sección asignada" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NO_SECTION_VALUE}>
                              Sin sección asignada
                            </SelectItem>
                            {sectionOptions.map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Solo se muestran secciones del período escolar activo.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Observaciones</Label>
                      <Textarea
                        rows={4}
                        value={alumnoDraft.observacionesGenerales}
                        onChange={(e) =>
                          setAlumnoDraft((prev) => ({
                            ...prev,
                            observacionesGenerales: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Motivo de rechazo o baja</Label>
                      <Textarea
                        rows={3}
                        value={alumnoDraft.motivoRechazoBaja}
                        onChange={(e) =>
                          setAlumnoDraft((prev) => ({
                            ...prev,
                            motivoRechazoBaja: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <Separator />

                  <HogarForm
                    formData={postulacionAdapter}
                    handleInputChange={handleAspiranteFieldChange}
                  />

                  <Separator />

                  <SaludForm
                    formData={postulacionAdapter}
                    handleInputChange={handleAspiranteFieldChange}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setEditOpen(false)}
                    disabled={savingProfile}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveProfile} disabled={savingProfile}>
                    {savingProfile && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Guardar cambios
                  </Button>
                </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </TooltipProvider>
          )}
        </div>

        {loading && <LoadingState label="Cargando información del alumno…" />}
        {error && <div className="text-sm text-red-600">{error}</div>}

        {!loading && !error && alumno && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              {/* Datos personales */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Datos personales</CardTitle>
                  <CardDescription>Información básica y contacto</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">
                      Nombre completo:{" "}
                    </span>
                    <span className="font-medium">{toNombre(persona)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">DNI: </span>
                      <span className="font-medium">
                        {persona?.dni ?? (persona as any)?.documento ?? "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fecha nac.: </span>
                      <span className="font-medium">
                        {(persona as any)?.fechaNacimiento ?? "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Género: </span>
                      <span className="font-medium">
                        {(persona as any)?.genero ?? "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Estado civil: </span>
                      <span className="font-medium">
                        {(persona as any)?.estadoCivil ?? "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Nacionalidad:{" "}
                      </span>
                      <span className="font-medium">
                        {(persona as any)?.nacionalidad ?? "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email: </span>
                      <span className="font-medium">{persona?.email ?? "—"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Teléfono: </span>
                      <span className="font-medium">
                        {(persona as any)?.telefono ?? "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Celular: </span>
                      <span className="font-medium">
                        {(persona as any)?.celular ?? "—"}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Domicilio: </span>
                    <span className="font-medium">
                      {(persona as any)?.domicilio ?? "—"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Acceso al sistema */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Acceso al sistema</CardTitle>
                  <CardDescription>
                    Gestioná las credenciales para que el alumno pueda iniciar
                    sesión.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-2 text-sm md:flex-row md:items-center md:justify-between">
                    <div>
                      {persona?.credencialesActivas ? (
                        <>
                          <div className="font-medium">{persona?.email}</div>
                          <div className="text-muted-foreground">
                            Roles:{" "}
                            {persona?.roles && persona.roles.length > 0
                              ? normalizeRoles(persona.roles)
                                  .map((role) => displayRole(role))
                                  .join(", ")
                              : "Sin roles"}
                          </div>
                        </>
                      ) : (
                        <div className="text-muted-foreground">
                          El alumno todavía no tiene credenciales asignadas.
                        </div>
                      )}
                    </div>
                    {canManageProfile && (
                      <div className="flex items-center gap-2">
                        <Dialog
                          open={credentialsDialogOpen}
                          onOpenChange={setCredentialsDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button>Gestionar acceso</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>
                                {persona?.credencialesActivas
                                  ? "Actualizar acceso"
                                  : "Crear acceso"}
                              </DialogTitle>
                              <DialogDescription>
                                El email será el usuario de inicio de sesión.
                                Para cambiar la contraseña ingresá y confirmá el
                                nuevo valor.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                  type="email"
                                  value={credentialsForm.email}
                                  onChange={(e) =>
                                    setCredentialsForm((prev) => ({
                                      ...prev,
                                      email: e.target.value,
                                    }))
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Contraseña</Label>
                                <Input
                                  type="password"
                                  value={credentialsForm.password}
                                  placeholder={
                                    persona?.credencialesActivas
                                      ? "Ingresá una nueva contraseña"
                                      : "Contraseña inicial"
                                  }
                                  onChange={(e) =>
                                    setCredentialsForm((prev) => ({
                                      ...prev,
                                      password: e.target.value,
                                    }))
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Confirmar contraseña</Label>
                                <Input
                                  type="password"
                                  value={credentialsForm.confirmPassword}
                                  onChange={(e) =>
                                    setCredentialsForm((prev) => ({
                                      ...prev,
                                      confirmPassword: e.target.value,
                                    }))
                                  }
                                />
                              </div>
                              {canEditRoles ? (
                                <div className="space-y-2">
                                  <Label>Roles del sistema</Label>
                                  <div className="grid gap-2">
                                    {studentRoleOptions.map((role) => {
                                      const checked =
                                        credentialsForm.roles.includes(role);
                                      return (
                                        <label
                                          key={role}
                                          className="flex items-center gap-2 text-sm text-muted-foreground"
                                        >
                                          <Checkbox
                                            checked={checked}
                                            onCheckedChange={(value) =>
                                              setCredentialsForm((prev) => {
                                                const isChecked = value === true;
                                                const nextRoles = isChecked
                                                  ? [...prev.roles, role]
                                                  : prev.roles.filter(
                                                      (r) => r !== role,
                                                    );
                                                return {
                                                  ...prev,
                                                  roles: normalizeRoles(
                                                    nextRoles,
                                                  ),
                                                };
                                              })
                                            }
                                          />
                                          <span>{displayRole(role)}</span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Seleccioná qué permisos tendrá el alumno en el
                                    sistema.
                                  </p>
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground">
                                  Solo el equipo directivo puede modificar los
                                  roles asignados.
                                </p>
                              )}
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setCredentialsDialogOpen(false)}
                              >
                                Cancelar
                              </Button>
                              <Button
                                onClick={handleSaveCredentials}
                                disabled={savingCredentials}
                              >
                                {savingCredentials && (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Guardar cambios
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        {persona?.credencialesActivas && (
                          <Button
                            variant="outline"
                            onClick={handleDisableCredentials}
                            disabled={savingCredentials}
                          >
                            {savingCredentials && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Desactivar acceso
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Condiciones del hogar</CardTitle>
                  <CardDescription>
                    Información familiar registrada durante la inscripción.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      Conectividad a internet:{" "}
                    </span>
                    <span className="font-medium">
                      {alumno?.conectividadInternet?.trim() || "—"}
                    </span>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Dispositivos disponibles</p>
                    <p className="font-medium whitespace-pre-line">
                      {alumno?.dispositivosDisponibles?.trim() || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Idiomas en el hogar</p>
                    <p className="font-medium whitespace-pre-line">
                      {alumno?.idiomasHabladosHogar?.trim() || "—"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Información de salud</CardTitle>
                  <CardDescription>
                    Antecedentes y observaciones médicas relevantes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Enfermedades o alergias</p>
                    <p className="font-medium whitespace-pre-line">
                      {alumno?.enfermedadesAlergias?.trim() || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Medicación habitual</p>
                    <p className="font-medium whitespace-pre-line">
                      {alumno?.medicacionHabitual?.trim() || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      Limitaciones físicas o neurológicas
                    </p>
                    <p className="font-medium whitespace-pre-line">
                      {alumno?.limitacionesFisicas?.trim() || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tratamientos terapéuticos</p>
                    <p className="font-medium whitespace-pre-line">
                      {alumno?.tratamientosTerapeuticos?.trim() || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Uso de ayudas de movilidad:{" "}
                    </span>
                    <span className="font-medium">
                      {alumno?.usoAyudasMovilidad === null ||
                      alumno?.usoAyudasMovilidad === undefined
                        ? "—"
                        : alumno.usoAyudasMovilidad
                          ? "Sí"
                          : "No"}
                    </span>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cobertura médica</p>
                    <p className="font-medium whitespace-pre-line">
                      {alumno?.coberturaMedica?.trim() || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Observaciones de salud</p>
                    <p className="font-medium whitespace-pre-line">
                      {alumno?.observacionesSalud?.trim() || "—"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Estado académico (matrícula + sección actual) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Estado académico</CardTitle>
                <CardDescription>
                  Sección vigente e historial de matrículas por período
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      Fecha de inscripción:{" "}
                    </span>
                    <span className="font-medium">
                      {alumno?.fechaInscripcion ?? "—"}
                    </span>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Observaciones generales</p>
                    <p className="font-medium whitespace-pre-line">
                      {alumno?.observacionesGenerales?.trim() || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Motivo de rechazo o baja</p>
                    <p className="font-medium whitespace-pre-line">
                      {alumno?.motivoRechazoBaja?.trim() || "—"}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/40 p-4 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Sección vigente
                      </p>
                      {seccionActual ? (
                        <>
                          <p className="text-base font-semibold">
                            {seccionLabel(seccionActual.seccionId)}
                          </p>
                          {seccionActual.desde && (
                            <p className="text-xs text-muted-foreground">
                              Desde {formatDate(seccionActual.desde)}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Sin sección vigente
                        </p>
                      )}
                    </div>
                    {matriculaActual && (
                      <div className="text-right">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Matrícula activa
                        </p>
                        <p className="text-sm font-semibold">
                          {getPeriodoNombre(
                            matriculaActual.periodoEscolarId,
                            ((matriculaActual as any)?.periodoEscolar ??
                              null) as { anio?: number } | null,
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID #{matriculaActual.id}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Historial académico
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Consulta cada matrícula y las secciones asignadas por
                      período.
                    </p>
                  </div>

                  {matriculasConHistorial.length ? (
                    <div className="space-y-3">
                      {matriculasConHistorial.map(({ matricula, filas }) => {
                        const esMatrizActual =
                          seccionActual?.matriculaId === matricula.id;
                        return (
                          <div
                            key={matricula.id}
                            className="rounded-lg border bg-background/60 p-4 text-sm"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                  Período escolar
                                </p>
                                <p className="text-base font-semibold">
                                  {getPeriodoNombre(
                                    matricula.periodoEscolarId,
                                    ((matricula as any)?.periodoEscolar ??
                                      null) as { anio?: number } | null,
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {esMatrizActual && (
                                  <Badge variant="default">Vigente</Badge>
                                )}
                                <Badge variant="outline">
                                  Matrícula #{matricula.id}
                                </Badge>
                              </div>
                            </div>

                            <div className="mt-3 space-y-2">
                              {filas.length ? (
                                filas.map((fila) => {
                                  const esFilaActual = seccionActual?.id === fila.id;
                                  return (
                                    <div
                                      key={fila.id}
                                      className="rounded-md border bg-muted/30 px-3 py-2"
                                    >
                                      <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="space-y-0.5">
                                          <p className="font-medium">
                                            {fila.seccionLabel ??
                                              seccionLabel(fila.seccionId)}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {formatRange(fila.desde, fila.hasta)}
                                          </p>
                                        </div>
                                        {esFilaActual && (
                                          <Badge variant="secondary">
                                            Sección vigente
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-sm text-muted-foreground">
                                  Sin secciones asignadas
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Sin matrículas registradas
                    </div>
                  )}
                </div>
            </CardContent>
          </Card>

          {canManageProfile && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Solicitudes de baja</CardTitle>
                <CardDescription>
                  Seguimiento del circuito de baja registrado para este alumno.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingSolicitudesBaja ? (
                  <LoadingState label="Cargando solicitudes…" />
                ) : solicitudesBajaError ? (
                  <div className="text-sm text-destructive">
                    {solicitudesBajaError}
                  </div>
                ) : solicitudesBaja.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay solicitudes de baja registradas para este alumno.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {solicitudesBaja.map((sol) => {
                      const estado =
                        sol.estado ?? EstadoSolicitudBaja.PENDIENTE;
                      const revisionEstado =
                        sol.estadoRevisionAdministrativa ??
                        EstadoRevisionAdministrativa.PENDIENTE;
                      const observacionRevision =
                        sol.observacionRevisionAdministrativa?.trim() || null;
                      const puedeResolver =
                        puedeDecidirBaja &&
                        estado === EstadoSolicitudBaja.PENDIENTE &&
                        revisionEstado !== EstadoRevisionAdministrativa.PENDIENTE;

                      return (
                        <div
                          key={sol.id}
                          className="rounded-lg border border-border/60 p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant={estadoSolicitudVariant[estado]}>
                                {estadoSolicitudLabels[estado]}
                              </Badge>
                              <Badge
                                variant={
                                  revisionAdministrativaVariant[revisionEstado]
                                }
                              >
                                {revisionAdministrativaLabels[revisionEstado]}
                              </Badge>
                              <Badge variant="outline">Solicitud #{sol.id}</Badge>
                            </div>
                            {sol.matriculaId && (
                              <div className="text-xs text-muted-foreground">
                                Matrícula #{sol.matriculaId}
                              </div>
                            )}
                          </div>

                          <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                            <div className="whitespace-pre-line">
                              {sol.motivo?.trim() || "—"}
                            </div>
                            {observacionRevision && (
                              <div className="rounded-md bg-muted/60 p-3 text-xs text-foreground">
                                <span className="font-medium">
                                  Detalle de administración:
                                </span>{" "}
                                <span className="whitespace-pre-line">
                                  {observacionRevision}
                                </span>
                              </div>
                            )}
                            <div className="grid gap-2 text-xs sm:grid-cols-2">
                              <div>
                                <span className="text-muted-foreground">
                                  Revisión administrativa:
                                </span>{" "}
                                {revisionEstado ===
                                EstadoRevisionAdministrativa.PENDIENTE
                                  ? "Pendiente"
                                  : formatDateTime(
                                      sol.fechaRevisionAdministrativa,
                                    )}
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Decisión final:
                                </span>{" "}
                                {estado === EstadoSolicitudBaja.PENDIENTE
                                  ? "Pendiente"
                                  : formatDateTime(sol.fechaDecision)}
                              </div>
                              {sol.revisadoAdministrativamentePorPersonaId && (
                                <div>
                                  <span className="text-muted-foreground">
                                    Revisó Adm.:
                                  </span>{" "}
                                  #{sol.revisadoAdministrativamentePorPersonaId}
                                </div>
                              )}
                              {sol.decididoPorPersonaId && (
                                <div>
                                  <span className="text-muted-foreground">
                                    Decidió Dirección:
                                  </span>{" "}
                                  #{sol.decididoPorPersonaId}
                                </div>
                              )}
                            </div>
                          </div>

                          {puedeResolver && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                onClick={() => requestAceptarSolicitud(sol)}
                                disabled={
                                  processingDecisionSolicitudId === sol.id
                                }
                              >
                                Aceptar baja
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => requestRechazarSolicitud(sol)}
                                disabled={
                                  processingDecisionSolicitudId === sol.id
                                }
                              >
                                Rechazar
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Familia */}
          <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>Familia</CardTitle>
                    <CardDescription>Vínculos y tutores</CardDescription>
                  </div>
                  {canManageProfile && (
                    <Dialog open={addFamilyOpen} onOpenChange={setAddFamilyOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">Agregar familiar</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Agregar familiar al alumno</DialogTitle>
                          <DialogDescription>
                            Buscá por DNI para reutilizar fichas existentes o completá los datos para crear un nuevo familiar.
                          </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>DNI</Label>
                          <Input
                            value={addPersonaDraft.dni}
                            onChange={(e) =>
                              setAddPersonaDraft((prev) => ({
                                ...prev,
                                dni: formatDni(e.target.value),
                              }))
                            }
                            placeholder="Documento del familiar"
                            disabled={savingFamily}
                            inputMode="numeric"
                            pattern="\d*"
                            minLength={7}
                            maxLength={10}
                          />
                          {addLookupLoading && (
                            <p className="text-xs text-muted-foreground">
                              Buscando persona…
                            </p>
                          )}
                          {!addLookupLoading && addPersonaExists && addLookupCompleted && (
                            <p className="text-xs text-muted-foreground">
                              Encontramos un familiar con este DNI. Se reutilizarán sus datos guardados.
                            </p>
                          )}
                          {!addLookupLoading &&
                            !addPersonaExists &&
                            addLookupCompleted &&
                            addDniValid && (
                              <p className="text-xs text-muted-foreground">
                                No encontramos un familiar con este DNI. Completá los datos para crear uno nuevo.
                              </p>
                            )}
                          {!addLookupLoading && !addPersonaReady && (
                            <p className="text-xs text-muted-foreground">
                              Ingresá un DNI de 7 a 10 dígitos para continuar.
                            </p>
                          )}
                        </div>

                        {addPersonaExists && addLookupCompleted ? (
                          <div className="space-y-2 rounded-md border bg-muted/50 p-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Nombre: </span>
                              <span className="font-medium">
                                {
                                  `${addPersonaDraft.apellido}, ${addPersonaDraft.nombre}`
                                    .trim()
                                    .replace(/^,\s*/, "") || "—"
                                }
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">DNI: </span>
                              <span className="font-medium">{addDniValue}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Email: </span>
                              <span className="font-medium">
                                {addPersonaDraft.email || "—"}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-4">
                              <div>
                                <span className="text-muted-foreground">Teléfono: </span>
                                <span className="font-medium">
                                  {addPersonaDraft.telefono || "—"}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Celular: </span>
                                <span className="font-medium">
                                  {addPersonaDraft.celular || "—"}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Revisá la relación a continuación para completar el vínculo.
                            </p>
                          </div>
                        ) : addPersonaReady ? (
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Email</Label>
                              <Input
                                type="email"
                                value={addPersonaDraft.email}
                                onChange={(e) =>
                                  setAddPersonaDraft((prev) => ({
                                    ...prev,
                                    email: e.target.value,
                                  }))
                                }
                                disabled={savingFamily}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Nombre</Label>
                              <Input
                                value={addPersonaDraft.nombre}
                                onChange={(e) =>
                                  setAddPersonaDraft((prev) => ({
                                    ...prev,
                                    nombre: e.target.value,
                                  }))
                                }
                                disabled={savingFamily}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Apellido</Label>
                              <Input
                                value={addPersonaDraft.apellido}
                                onChange={(e) =>
                                  setAddPersonaDraft((prev) => ({
                                    ...prev,
                                    apellido: e.target.value,
                                  }))
                                }
                                disabled={savingFamily}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Teléfono</Label>
                              <Input
                                type="tel"
                                inputMode="numeric"
                                pattern="\\d*"
                                value={addPersonaDraft.telefono}
                                onChange={(e) =>
                                  setAddPersonaDraft((prev) => ({
                                    ...prev,
                                    telefono: onlyDigits(e.target.value),
                                  }))
                                }
                                disabled={savingFamily}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Celular</Label>
                              <Input
                                type="tel"
                                inputMode="numeric"
                                pattern="\\d*"
                                value={addPersonaDraft.celular}
                                onChange={(e) =>
                                  setAddPersonaDraft((prev) => ({
                                    ...prev,
                                    celular: onlyDigits(e.target.value),
                                  }))
                                }
                                disabled={savingFamily}
                              />
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Ingresá un DNI válido para buscar familiares existentes o crear uno nuevo.
                          </p>
                        )}

                        <Separator />
                        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px]">
                          <div className="space-y-2">
                            <Label>Rol familiar</Label>
                            <Select
                              value={addRol ?? ""}
                              onValueChange={(value) => setAddRol(value as RolVinculo)}
                              disabled={savingFamily || !addPersonaReady}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccioná un rol" />
                              </SelectTrigger>
                              <SelectContent>
                                {rolOptions.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {formatRol(option)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center justify-center gap-2 md:justify-start md:place-self-center">
                            <Checkbox
                              id="add-convive"
                              checked={addConvive}
                              onCheckedChange={(value) => setAddConvive(Boolean(value))}
                              disabled={savingFamily || !addPersonaReady}
                            />
                            <Label htmlFor="add-convive">Convive</Label>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setAddFamilyOpen(false)}
                          disabled={savingFamily}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleSaveFamily}
                          disabled={savingFamily || !addPersonaReady}
                        >
                          {savingFamily && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Guardar familiar
                        </Button>
                      </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {familiares.length ? (
                  familiares.map((f) => {
                    const personaId = f.personaId ?? f.id ?? f._persona?.id ?? null;
                    return (
                      <div
                        key={f.id}
                        className="w-full rounded-md border bg-background text-left transition hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary"
                      >
                        <div className="flex items-center justify-between px-3 py-2">
                          <div className="text-sm">
                            <div className="font-medium">{toNombre(f._persona)}</div>
                            <div className="text-muted-foreground">
                              DNI:{" "}
                              {f._persona?.dni ??
                                (f._persona as any)?.documento ??
                                "—"}
                            </div>
                            <div className="text-muted-foreground">
                              Contacto:{" "}
                              {(f._persona as any)?.telefono ??
                                (f._persona as any)?.celular ??
                                f._persona?.email ??
                                "—"}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {f.rolVinculo && (
                              <Badge variant="outline">{formatRol(f.rolVinculo)}</Badge>
                            )}
                            {f.convive && <Badge variant="default">Convive</Badge>}
                          </div>
                        </div>
                        <Separator />
                        <div className="flex flex-wrap items-center justify-end gap-2 px-3 py-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/familiares/${f.id}`)}
                          >
                            Ver ficha
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleOpenFamilyChat(personaId)}
                            disabled={!personaId}
                          >
                            Enviar mensaje
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Sin familiares vinculados
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        )}
        <AlertDialog
          open={approveDialogSolicitud != null}
          onOpenChange={(open) => {
            if (!open) {
              setApproveDialogSolicitud(null);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar baja</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Confirmás aceptar la baja del alumno {" "}
                {getSolicitudAlumnoNombre(approveDialogSolicitud)}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={
                  approveDialogSolicitud != null &&
                  processingDecisionSolicitudId === approveDialogSolicitud.id
                }
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  const sol = approveDialogSolicitud;
                  if (sol) {
                    void handleAceptarSolicitud(sol);
                  }
                }}
                disabled={
                  approveDialogSolicitud == null ||
                  processingDecisionSolicitudId === approveDialogSolicitud.id
                }
              >
                {approveDialogSolicitud != null &&
                processingDecisionSolicitudId === approveDialogSolicitud.id
                  ? "Procesando…"
                  : "Aceptar baja"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Dialog
          open={rejectDialogSolicitud != null}
          onOpenChange={(open) => {
            if (!open) {
              setRejectDialogSolicitud(null);
              setRejectMotivo("");
            }
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Rechazar solicitud de baja</DialogTitle>
              <DialogDescription>
                Indicá el motivo del rechazo para {" "}
                {getSolicitudAlumnoNombre(rejectDialogSolicitud)}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="motivo-rechazo-detalle">Motivo</Label>
                <Textarea
                  id="motivo-rechazo-detalle"
                  value={rejectMotivo}
                  onChange={(event) => setRejectMotivo(event.target.value)}
                  rows={4}
                  disabled={
                    rejectDialogSolicitud != null &&
                    processingDecisionSolicitudId === rejectDialogSolicitud.id
                  }
                />
              </div>
            </div>
            <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialogSolicitud(null);
                  setRejectMotivo("");
                }}
                disabled={
                  rejectDialogSolicitud != null &&
                  processingDecisionSolicitudId === rejectDialogSolicitud.id
                }
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  const sol = rejectDialogSolicitud;
                  if (sol) {
                    void handleRechazarSolicitud(sol, rejectMotivo);
                  }
                }}
                disabled={
                  rejectDialogSolicitud == null ||
                  processingDecisionSolicitudId === rejectDialogSolicitud.id
                }
              >
                {rejectDialogSolicitud != null &&
                processingDecisionSolicitudId === rejectDialogSolicitud.id
                  ? "Procesando…"
                  : "Rechazar solicitud"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

  );
}
