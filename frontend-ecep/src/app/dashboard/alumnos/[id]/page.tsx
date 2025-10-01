"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod";
import { useViewerScope } from "@/hooks/scope/useViewerScope";
import { logger } from "@/lib/logger";

const alumnosLogger = logger.child({ module: "dashboard-alumnos-detalle" });

const logAlumnoError = (error: unknown, message?: string) => {
  if (message) {
    alumnosLogger.error({ err: error }, message);
  } else {
    alumnosLogger.error({ err: error });
  }
};
import { useAuth } from "@/hooks/useAuth";
import { formatDni } from "@/lib/form-utils";
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
import { isBirthDateValid, maxBirthDate } from "@/lib/form-utils";
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
import { RolVinculo, UserRole } from "@/types/api-generated";

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

  const [familiares, setFamiliares] = useState<FamiliarConVinculo[]>([]);

  const { periodoEscolarId: activePeriodId, getPeriodoNombre } = useActivePeriod();
  const { hasRole } = useAuth();
  const { type: viewerScope } = useViewerScope();
  const canManageProfile = viewerScope === "staff";
  const canEditRoles =
    canManageProfile && (hasRole(UserRole.ADMIN) || hasRole(UserRole.DIRECTOR));

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
    const turno = (s as any).turno ?? "";
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
  });
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
      celular: persona?.celular ?? "",
      email: persona?.email ?? "",
    });
    setAlumnoDraft({
      fechaInscripcion: alumno?.fechaInscripcion ?? "",
      observacionesGenerales: alumno?.observacionesGenerales ?? "",
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
              telefono: personaData.telefono ?? "",
              celular: personaData.celular ?? "",
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
        celular: personaDraft.celular || undefined,
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
      setAlumno((prev) => (prev ? { ...prev, personaId } : prev));

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
        telefono: addPersonaDraft.telefono.trim() || undefined,
        celular: addPersonaDraft.celular.trim() || undefined,
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
        <Button variant="outline" onClick={() => router.back()}>
          Volver
        </Button>
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
            </div>
          </div>
          {canManageProfile && (
            <div className="flex items-center gap-2">
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
                          value={personaDraft.celular}
                          onChange={(e) =>
                            setPersonaDraft((prev) => ({
                              ...prev,
                              celular: e.target.value,
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
                  </div>
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
                                value={addPersonaDraft.telefono}
                                onChange={(e) =>
                                  setAddPersonaDraft((prev) => ({
                                    ...prev,
                                    telefono: e.target.value,
                                  }))
                                }
                                disabled={savingFamily}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Celular</Label>
                              <Input
                                value={addPersonaDraft.celular}
                                onChange={(e) =>
                                  setAddPersonaDraft((prev) => ({
                                    ...prev,
                                    celular: e.target.value,
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
      </div>
    
  );
}
