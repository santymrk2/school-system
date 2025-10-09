"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  gestionAcademica,
  identidad,
  vidaEscolar,
} from "@/services/api/modules";
import { isBirthDateValid, maxBirthDate, formatDni } from "@/lib/form-utils";
import type * as DTO from "@/types/api-generated";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/common/BackButton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_GENERO_VALUE,
  GENERO_OPTIONS,
  normalizeGenero,
} from "@/lib/genero";
import { Loader2 } from "lucide-react";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod";
import { logger } from "@/lib/logger";
import { Step3 as HogarForm } from "@/app/postulacion/Step3";
import { Step4 as SaludForm } from "@/app/postulacion/Step4";
import type { PostulacionFormData } from "@/app/postulacion/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RolVinculo } from "@/types/api-generated";

const alumnosAltaLogger = logger.child({ module: "dashboard-alumnos-alta" });

const logAltaError = (error: unknown, message?: string) => {
  if (message) {
    alumnosAltaLogger.error({ err: error }, message);
  } else {
    alumnosAltaLogger.error({ err: error });
  }
};

const emptyPersona: PersonaForm = {
  nombre: "",
  apellido: "",
  dni: "",
  fechaNacimiento: "",
  genero: DEFAULT_GENERO_VALUE,
  estadoCivil: "",
  nacionalidad: "",
  domicilio: "",
  telefono: "",
  celular: "",
  email: "",
};

type PersonaForm = {
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  genero: string;
  estadoCivil: string;
  nacionalidad: string;
  domicilio: string;
  telefono: string;
  celular: string;
  email: string;
};

type AlumnoForm = {
  fechaInscripcion: string;
  observacionesGenerales: string;
  motivoRechazoBaja: string;
  seccionId: string;
};

const emptyAlumno: AlumnoForm = {
  fechaInscripcion: "",
  observacionesGenerales: "",
  motivoRechazoBaja: "",
  seccionId: "",
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

type TutorForm = {
  personaId: number | null;
  familiarId: number | null;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  celular: string;
  rolVinculo: RolVinculo | "";
  convive: boolean;
};

const emptyTutor: TutorForm = {
  personaId: null,
  familiarId: null,
  nombre: "",
  apellido: "",
  dni: "",
  email: "",
  telefono: "",
  celular: "",
  rolVinculo: "",
  convive: false,
};

export default function AltaAlumnoPage() {
  const router = useRouter();
  const [personaId, setPersonaId] = useState<number | null>(null);
  const [personaPreview, setPersonaPreview] = useState<DTO.PersonaDTO | null>(
    null,
  );
  const [personaForm, setPersonaForm] = useState<PersonaForm>(emptyPersona);
  const [dniLookupLoading, setDniLookupLoading] = useState(false);
  const [lastLookupDni, setLastLookupDni] = useState<string>("");

  const [alumnoForm, setAlumnoForm] = useState<AlumnoForm>(emptyAlumno);
  const [aspiranteForm, setAspiranteForm] =
    useState<AspiranteComplementoForm>(emptyAspiranteComplemento);
  const [tutores, setTutores] = useState<TutorForm[]>([]);
  const [familiaresCatalog, setFamiliaresCatalog] = useState<DTO.FamiliarDTO[]>(
    [],
  );
  const [tutorModalOpen, setTutorModalOpen] = useState(false);
  const [tutorDraft, setTutorDraft] = useState<TutorForm>(emptyTutor);
  const [tutorLookupLoading, setTutorLookupLoading] = useState(false);
  const [tutorLookupCompleted, setTutorLookupCompleted] = useState(false);
  const [tutorPersonaExists, setTutorPersonaExists] = useState(false);
  const [savingTutorDraft, setSavingTutorDraft] = useState(false);
  const [creatingAlumno, setCreatingAlumno] = useState(false);
  const [secciones, setSecciones] = useState<DTO.SeccionDTO[]>([]);
  const { periodoEscolarId: activePeriodId } = useActivePeriod();

  const canSubmit = useMemo(() => {
    const nombreOk = Boolean(personaForm.nombre.trim());
    const apellidoOk = Boolean(personaForm.apellido.trim());
    const dniOk = formatDni(personaForm.dni).length >= 7;
    const seccionOk = Boolean(alumnoForm.seccionId);
    const hogarOk =
      Boolean(aspiranteForm.conectividadInternet?.trim()) &&
      Boolean(aspiranteForm.dispositivosDisponibles?.trim()) &&
      Boolean(aspiranteForm.idiomasHabladosHogar?.trim());
    return nombreOk && apellidoOk && dniOk && seccionOk && hogarOk;
  }, [
    personaForm.nombre,
    personaForm.apellido,
    personaForm.dni,
    alumnoForm.seccionId,
    aspiranteForm.conectividadInternet,
    aspiranteForm.dispositivosDisponibles,
    aspiranteForm.idiomasHabladosHogar,
  ]);

  const rolOptions = useMemo(() => Object.values(RolVinculo), []);

  const formatRol = useCallback((value?: RolVinculo | string | null) => {
    if (!value) return "Sin vínculo";
    const formatted = String(value).replace(/_/g, " ").toLowerCase();
    return formatted.replace(/\b\w/g, (char) => char.toUpperCase());
  }, []);

  useEffect(() => {
    if (!activePeriodId) {
      setSecciones([]);
      return;
    }
    (async () => {
      try {
        const res = await gestionAcademica.secciones.list();
        const data = (res.data ?? []).filter((s: any) => {
          const pid =
            s?.periodoEscolarId ?? s?.periodoId ?? s?.periodoEscolar?.id;
          return pid === activePeriodId;
        });
        setSecciones(data);
      } catch (error) {
        logAltaError(error);
      }
    })();
  }, [activePeriodId]);

  const cargarPersona = async (id: number) => {
    try {
      const { data } = await identidad.personasCore.getById(id);
      setPersonaPreview(data);
      setPersonaId(data.id);
      setPersonaForm({
        nombre: data.nombre ?? "",
        apellido: data.apellido ?? "",
        dni: formatDni(data.dni ?? ""),
        fechaNacimiento: data.fechaNacimiento ?? "",
        genero: normalizeGenero(data.genero) || DEFAULT_GENERO_VALUE,
        estadoCivil: data.estadoCivil ?? "",
        nacionalidad: data.nacionalidad ?? "",
        domicilio: data.domicilio ?? "",
        telefono: data.telefono ?? "",
        celular: data.celular ?? "",
        email: data.email ?? "",
      });
    } catch (error: any) {
      logAltaError(error);
    }
  };

  useEffect(() => {
    const dni = formatDni(personaForm.dni);
    if (!dni || dni.length < 7 || dni.length > 10) {
      setDniLookupLoading(false);
      return;
    }
    const previewDni = personaPreview?.dni ? formatDni(personaPreview.dni) : "";
    if (previewDni === dni) {
      return;
    }
    if (lastLookupDni === dni) {
      return;
    }
    setDniLookupLoading(true);
    let cancelled = false;
    const handle = setTimeout(async () => {
      try {
        const { data: id } = await identidad.personasCore.findIdByDni(dni);
        if (!cancelled) {
          await cargarPersona(Number(id));
          setLastLookupDni(dni);
        }
      } catch (error: any) {
        if (!cancelled) {
          if (error?.response?.status === 404) {
            setPersonaId(null);
            setPersonaPreview(null);
            setLastLookupDni(dni);
          } else {
            logAltaError(error);
          }
        }
      } finally {
        if (!cancelled) setDniLookupLoading(false);
      }
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [personaForm.dni, personaPreview, lastLookupDni]);

  useEffect(() => {
    if (!tutorModalOpen) return;
    let alive = true;
    setTutorDraft(emptyTutor);
    setTutorLookupLoading(false);
    setTutorLookupCompleted(false);
    setTutorPersonaExists(false);
    setSavingTutorDraft(false);
    (async () => {
      try {
        const { data } = await identidad.familiares.list();
        if (!alive) return;
        setFamiliaresCatalog(data ?? []);
      } catch (error) {
        logAltaError(error);
        if (!alive) return;
        setFamiliaresCatalog([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [tutorModalOpen]);

  useEffect(() => {
    if (!tutorModalOpen) return;
    const dni = formatDni(tutorDraft.dni);
    if (dni.length < 7 || dni.length > 10) {
      setTutorDraft((prev) => ({
        ...prev,
        personaId: null,
        familiarId: null,
      }));
      setTutorLookupLoading(false);
      setTutorLookupCompleted(false);
      setTutorPersonaExists(false);
      return;
    }
    setTutorLookupLoading(true);
    setTutorLookupCompleted(false);
    let alive = true;
    const handler = setTimeout(async () => {
      try {
        const { data: personaId } = await identidad.personasCore.findIdByDni(
          dni,
        );
        if (!alive) return;
        if (personaId) {
          const personaData = await identidad.personasCore
            .getById(Number(personaId))
            .then((res) => res.data ?? null)
            .catch(() => null);
          if (!alive) return;
          setTutorDraft((prev) => ({
            ...prev,
            personaId: Number(personaId),
            familiarId:
              familiaresCatalog.find(
                (fam) => fam.personaId === Number(personaId),
              )?.id ?? null,
            nombre: personaData?.nombre ?? prev.nombre,
            apellido: personaData?.apellido ?? prev.apellido,
            dni,
            email: personaData?.email ?? prev.email,
            telefono: personaData?.telefono ?? prev.telefono,
            celular: personaData?.celular ?? prev.celular,
          }));
          setTutorPersonaExists(true);
        } else {
          setTutorDraft((prev) => ({
            ...prev,
            personaId: null,
            familiarId: null,
            dni,
          }));
          setTutorPersonaExists(false);
        }
      } catch (error: any) {
        if (!alive) return;
        if (error?.response?.status === 404) {
          setTutorDraft((prev) => ({
            ...prev,
            personaId: null,
            familiarId: null,
            dni,
          }));
          setTutorPersonaExists(false);
        } else {
          logAltaError(error);
        }
      } finally {
        if (!alive) return;
        setTutorLookupLoading(false);
        setTutorLookupCompleted(true);
      }
    }, 400);
    return () => {
      alive = false;
      clearTimeout(handler);
    };
  }, [familiaresCatalog, tutorDraft.dni, tutorModalOpen]);

  const persistPersona = async (): Promise<number> => {
    const dniValue = formatDni(personaForm.dni);
    if (!personaForm.nombre || !personaForm.apellido || !dniValue) {
      throw new Error("Completá nombre, apellido y DNI");
    }
    if (dniValue.length < 7 || dniValue.length > 10) {
      throw new Error("El DNI debe tener entre 7 y 10 dígitos.");
    }
    const createPayload: DTO.PersonaCreateDTO = {
      nombre: personaForm.nombre,
      apellido: personaForm.apellido,
      dni: dniValue,
      fechaNacimiento: personaForm.fechaNacimiento || undefined,
      genero: personaForm.genero || undefined,
      estadoCivil: personaForm.estadoCivil || undefined,
      nacionalidad: personaForm.nacionalidad || undefined,
      domicilio: personaForm.domicilio || undefined,
      telefono: personaForm.telefono || undefined,
      celular: personaForm.celular || undefined,
      email: personaForm.email || undefined,
    };
    if (personaId) {
      const updatePayload: DTO.PersonaUpdateDTO = { ...createPayload };
      await identidad.personasCore.update(personaId, updatePayload);
      await cargarPersona(personaId);
      setLastLookupDni(createPayload.dni);
      return personaId;
    }
    const { data } = await identidad.personasCore.create(createPayload);
    const newId = Number(data);
    await cargarPersona(newId);
    setLastLookupDni(createPayload.dni);
    return newId;
  };

  const handlePersistTutores = useCallback(
    async (alumnoId: number) => {
      for (const tutor of tutores) {
        const dniValue = formatDni(tutor.dni);
        if (!dniValue) {
          throw new Error("No pudimos determinar el DNI del tutor");
        }

        let personaId = tutor.personaId ?? null;
        const personaPayload: DTO.PersonaCreateDTO = {
          nombre: tutor.nombre.trim(),
          apellido: tutor.apellido.trim(),
          dni: dniValue,
          email: tutor.email.trim() || undefined,
          telefono: tutor.telefono.trim() || undefined,
          celular: tutor.celular.trim() || undefined,
        };

        if (personaId) {
          await identidad.personasCore.update(personaId, personaPayload);
        } else {
          const { data: created } = await identidad.personasCore.create(
            personaPayload,
          );
          personaId = Number(created);
        }

        if (!personaId) {
          throw new Error("No pudimos guardar la persona del tutor");
        }

        let familiarId = tutor.familiarId ?? null;
        if (familiarId) {
          await identidad.familiares.update(
            familiarId,
            { id: familiarId, personaId } as any,
          );
        } else {
          try {
            const { data: familiarCreated } = await identidad.familiares.create({
              personaId,
            } as any);
            familiarId = Number(familiarCreated);
          } catch (error: any) {
            if (error?.response?.status === 400) {
              familiarId = personaId;
            } else {
              throw error;
            }
          }
        }

        familiarId = familiarId ?? personaId;
        if (!familiarId) {
          throw new Error("No pudimos registrar el familiar vinculado");
        }

        await identidad.alumnoFamiliares.create({
          alumnoId,
          familiarId,
          rolVinculo: tutor.rolVinculo as RolVinculo,
          convive: Boolean(tutor.convive),
        } as any);
      }
    },
    [tutores],
  );

  const handleAsignarSeccion = useCallback(
    async (matriculaId: number) => {
      if (!alumnoForm.seccionId) return;
      try {
        await vidaEscolar.matriculaSeccionHistorial.create({
          matriculaId,
          seccionId: Number(alumnoForm.seccionId),
          desde:
            alumnoForm.fechaInscripcion ||
            new Date().toISOString().slice(0, 10),
        });
      } catch (error: any) {
        toast.error(error?.message ?? "No se pudo asignar la sección");
      }
    },
    [alumnoForm.fechaInscripcion, alumnoForm.seccionId],
  );

  const handleCrearAlumno = async () => {
    if (!alumnoForm.seccionId) {
      toast.error("Seleccioná una sección para matricular al alumno");
      return;
    }
    if (
      personaForm.fechaNacimiento &&
      !isBirthDateValid(personaForm.fechaNacimiento)
    ) {
      toast.error(
        "La fecha de nacimiento debe ser al menos dos años anterior a hoy.",
      );
      return;
    }
    if (!activePeriodId) {
      toast.error("No hay un período escolar activo disponible");
      return;
    }
    if (!aspiranteForm.conectividadInternet?.trim()) {
      toast.error("Completá la conectividad del hogar");
      return;
    }
    if (!aspiranteForm.dispositivosDisponibles?.trim()) {
      toast.error("Indicá los dispositivos disponibles");
      return;
    }
    if (!aspiranteForm.idiomasHabladosHogar?.trim()) {
      toast.error("Completá los idiomas hablados en el hogar");
      return;
    }
    setCreatingAlumno(true);
    try {
      const personaPersistidaId = await persistPersona();
      setPersonaId(personaPersistidaId);

      const payload: DTO.AlumnoDTO = {
        personaId: personaPersistidaId,
        fechaInscripcion: alumnoForm.fechaInscripcion || undefined,
        observacionesGenerales:
          alumnoForm.observacionesGenerales || undefined,
        motivoRechazoBaja: alumnoForm.motivoRechazoBaja || undefined,
        conectividadInternet: aspiranteForm.conectividadInternet || undefined,
        dispositivosDisponibles:
          aspiranteForm.dispositivosDisponibles || undefined,
        idiomasHabladosHogar:
          aspiranteForm.idiomasHabladosHogar || undefined,
        enfermedadesAlergias:
          aspiranteForm.enfermedadesAlergias || undefined,
        medicacionHabitual: aspiranteForm.medicacionHabitual || undefined,
        limitacionesFisicas:
          aspiranteForm.limitacionesFisicasNeurologicas || undefined,
        tratamientosTerapeuticos:
          aspiranteForm.tratamientosTerapeuticos || undefined,
        usoAyudasMovilidad:
          aspiranteForm.usoAyudasMovilidad ?? undefined,
        coberturaMedica: aspiranteForm.coberturaMedica || undefined,
        observacionesSalud:
          aspiranteForm.observacionesAdicionalesSalud || undefined,
      };
      const { data: alumnoId } = await identidad.alumnos.create(payload);
      const matriculaPayload: DTO.MatriculaCreateDTO = {
        alumnoId,
        periodoEscolarId: activePeriodId,
      };
      const { data: matriculaId } = await vidaEscolar.matriculas.create(
        matriculaPayload,
      );
      await handleAsignarSeccion(matriculaId);
      if (tutores.length) {
        await handlePersistTutores(alumnoId);
      }
      toast.success("Alumno matriculado correctamente");
      router.push(`/dashboard/alumnos/${alumnoId}`);
    } catch (error: any) {
      toast.error(error?.message ?? "No se pudo registrar el alumno");
    } finally {
      setCreatingAlumno(false);
    }
  };

  const postulacionAdapter = useMemo(() => {
    return {
      ...aspiranteForm,
      familiares: [],
    } as PostulacionFormData;
  }, [aspiranteForm]);

  const handleAspiranteFieldChange = useCallback(
    (field: string, value: any) => {
      setAspiranteForm((prev) => {
        if (field === "usoAyudasMovilidad") {
          return { ...prev, usoAyudasMovilidad: Boolean(value) };
        }
        return { ...prev, [field]: value ?? "" } as AspiranteComplementoForm;
      });
    },
    [],
  );

  const handleAddTutorToList = () => {
    const dniValue = formatDni(tutorDraft.dni);
    if (!dniValue || dniValue.length < 7 || dniValue.length > 10) {
      toast.error("Ingresá un DNI válido para el tutor");
      return;
    }
    if (
      !tutorPersonaExists &&
      (!tutorDraft.nombre.trim() || !tutorDraft.apellido.trim())
    ) {
      toast.error("Completá nombre y apellido del tutor");
      return;
    }
    if (!tutorDraft.rolVinculo) {
      toast.error("Seleccioná el rol del tutor");
      return;
    }
    if (
      tutores.some(
        (existing) =>
          formatDni(existing.dni) === dniValue &&
          String(existing.rolVinculo) === String(tutorDraft.rolVinculo),
      )
    ) {
      toast.error("Ya agregaste un tutor con este DNI y rol");
      return;
    }
    setSavingTutorDraft(true);
    setTutores((prev) => [
      ...prev,
      {
        personaId: tutorDraft.personaId,
        familiarId: tutorDraft.familiarId,
        nombre: tutorDraft.nombre.trim(),
        apellido: tutorDraft.apellido.trim(),
        dni: dniValue,
        email: tutorDraft.email.trim(),
        telefono: tutorDraft.telefono.trim(),
        celular: tutorDraft.celular.trim(),
        rolVinculo: tutorDraft.rolVinculo,
        convive: tutorDraft.convive,
      },
    ]);
    setTutorModalOpen(false);
    setSavingTutorDraft(false);
  };

  const handleRemoveTutor = (dni: string, rol: RolVinculo | "") => {
    const dniValue = formatDni(dni);
    setTutores((prev) =>
      prev.filter(
        (tutor) =>
          !(formatDni(tutor.dni) === dniValue && String(tutor.rolVinculo) === String(rol)),
      ),
    );
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      <BackButton href="/dashboard/alumnos" />
      <div>
        <h1 className="text-3xl font-bold">Alta manual de alumno</h1>
        <p className="text-muted-foreground">
          Cargá la persona y los datos básicos para vincularla como alumno.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Identificación del alumno</CardTitle>
          <CardDescription>
            Ingresá los datos personales. Si el DNI ya está registrado, completaremos la información automáticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative space-y-6">
            <PersonaFormFields
              values={personaForm}
              onChange={(field, value) =>
                setPersonaForm((prev) => ({
                  ...prev,
                  [field]:
                    field === "dni" && typeof value === "string"
                      ? formatDni(value)
                      : value,
                }))
              }
            />
            {dniLookupLoading && (
              <div className="absolute right-0 top-0 flex items-center text-xs text-muted-foreground">
                <Loader2 className="mr-2 h-3 w-3 animate-spin" /> Buscando persona…
              </div>
            )}
          </div>
          {personaId && (
            <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
              Persona existente detectada (ID #{personaId}). Actualizá los datos si es necesario antes de registrar al alumno.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información académica</CardTitle>
          <CardDescription>
            Definí la matriculación inicial y registrá cualquier observación relevante para el legajo del alumno.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Fecha de inscripción
              </label>
              <DatePicker
                value={alumnoForm.fechaInscripcion || undefined}
                onChange={(value) =>
                  setAlumnoForm((prev) => ({
                    ...prev,
                    fechaInscripcion: value ?? "",
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Sección
              </label>
              <Select
                value={alumnoForm.seccionId}
                onValueChange={(value) =>
                  setAlumnoForm((prev) => ({
                    ...prev,
                    seccionId: value,
                  }))
                }
                disabled={!secciones.length}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccioná la sección" />
                </SelectTrigger>
                <SelectContent>
                  {secciones.map((sec) => (
                    <SelectItem key={sec.id} value={String(sec.id)}>
                      {sec.nivel} — {sec.gradoSala} {sec.division} ({sec.turno})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!secciones.length && (
                <p className="text-xs text-muted-foreground">
                  No hay secciones disponibles para el período escolar activo.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Motivo de rechazo (opcional)
              </label>
              <Textarea
                rows={3}
                value={alumnoForm.motivoRechazoBaja}
                onChange={(e) =>
                  setAlumnoForm((prev) => ({
                    ...prev,
                    motivoRechazoBaja: e.target.value,
                  }))
                }
                placeholder="Por ejemplo, si se rechazó una baja previa o requiere seguimiento especial"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Observaciones generales
            </label>
            <Textarea
              rows={4}
              value={alumnoForm.observacionesGenerales}
              onChange={(e) =>
                setAlumnoForm((prev) => ({
                  ...prev,
                  observacionesGenerales: e.target.value,
                }))
              }
              placeholder="Notas internas, antecedentes o información complementaria"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Condiciones del hogar</CardTitle>
          <CardDescription>
            Registrá la información del entorno familiar para la ficha del aspirante.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <HogarForm
            formData={postulacionAdapter}
            handleInputChange={handleAspiranteFieldChange}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información de salud</CardTitle>
          <CardDescription>
            Indicá antecedentes y observaciones médicas relevantes para el seguimiento institucional.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SaludForm
            formData={postulacionAdapter}
            handleInputChange={handleAspiranteFieldChange}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tutores y familiares responsables</CardTitle>
          <CardDescription>
            Agregá los tutores principales que acompañarán la trayectoria del alumno.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setTutorModalOpen(true)}>
              Agregar tutor
            </Button>
          </div>
          {tutores.length ? (
            <div className="space-y-3">
              {tutores.map((tutor) => (
                <div
                  key={`${tutor.dni}-${tutor.rolVinculo}`}
                  className="flex flex-col gap-2 rounded-md border p-3 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {tutor.apellido}, {tutor.nombre}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      DNI {formatDni(tutor.dni)} · {formatRol(tutor.rolVinculo)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tutor.convive ? "Convive" : "No convive"}
                    </p>
                    {(tutor.telefono || tutor.celular || tutor.email) && (
                      <p className="text-xs text-muted-foreground">
                        {[tutor.telefono, tutor.celular, tutor.email]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveTutor(tutor.dni, tutor.rolVinculo)}
                  >
                    Quitar
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aún no cargaste tutores. Podés agregarlos ahora o más tarde desde el perfil del alumno.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/alumnos")}
        >
          Cancelar
        </Button>
        <Button onClick={handleCrearAlumno} disabled={creatingAlumno || !canSubmit}>
          {creatingAlumno && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Registrar alumno
        </Button>
      </div>

      <Dialog open={tutorModalOpen} onOpenChange={setTutorModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agregar tutor</DialogTitle>
            <DialogDescription>
              Buscá por DNI para reutilizar fichas existentes o completá los datos para crear un nuevo tutor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>DNI</Label>
              <Input
                value={tutorDraft.dni}
                onChange={(e) =>
                  setTutorDraft((prev) => ({
                    ...prev,
                    dni: formatDni(e.target.value),
                  }))
                }
                placeholder="Documento del tutor"
                disabled={savingTutorDraft}
                inputMode="numeric"
                pattern="\d*"
                minLength={7}
                maxLength={10}
              />
              {tutorLookupLoading && (
                <p className="text-xs text-muted-foreground">Buscando persona…</p>
              )}
              {!tutorLookupLoading && tutorPersonaExists && tutorLookupCompleted && (
                <p className="text-xs text-muted-foreground">
                  Encontramos una persona registrada con este DNI. Revisá y completá los datos de contacto si es necesario.
                </p>
              )}
              {!tutorLookupLoading && !tutorPersonaExists && tutorLookupCompleted && (
                <p className="text-xs text-muted-foreground">
                  No encontramos un registro previo. Completá los datos para crear al tutor.
                </p>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={tutorDraft.nombre}
                  onChange={(e) =>
                    setTutorDraft((prev) => ({
                      ...prev,
                      nombre: e.target.value,
                    }))
                  }
                  disabled={savingTutorDraft}
                />
              </div>
              <div className="space-y-2">
                <Label>Apellido</Label>
                <Input
                  value={tutorDraft.apellido}
                  onChange={(e) =>
                    setTutorDraft((prev) => ({
                      ...prev,
                      apellido: e.target.value,
                    }))
                  }
                  disabled={savingTutorDraft}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={tutorDraft.email}
                  onChange={(e) =>
                    setTutorDraft((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  disabled={savingTutorDraft}
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  value={tutorDraft.telefono}
                  onChange={(e) =>
                    setTutorDraft((prev) => ({
                      ...prev,
                      telefono: e.target.value,
                    }))
                  }
                  disabled={savingTutorDraft}
                />
              </div>
              <div className="space-y-2">
                <Label>Celular</Label>
                <Input
                  value={tutorDraft.celular}
                  onChange={(e) =>
                    setTutorDraft((prev) => ({
                      ...prev,
                      celular: e.target.value,
                    }))
                  }
                  disabled={savingTutorDraft}
                />
              </div>
            </div>

            <Separator />
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
              <div className="space-y-2">
                <Label>Rol familiar</Label>
                <Select
                  value={tutorDraft.rolVinculo || ""}
                  onValueChange={(value) =>
                    setTutorDraft((prev) => ({
                      ...prev,
                      rolVinculo: value as RolVinculo,
                    }))
                  }
                  disabled={savingTutorDraft}
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
              <div className="flex items-center gap-2 md:justify-center">
                <Checkbox
                  id="tutor-convive"
                  checked={tutorDraft.convive}
                  onCheckedChange={(checked) =>
                    setTutorDraft((prev) => ({
                      ...prev,
                      convive: Boolean(checked),
                    }))
                  }
                  disabled={savingTutorDraft}
                />
                <Label htmlFor="tutor-convive">Convive</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTutorModalOpen(false)}
              disabled={savingTutorDraft}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddTutorToList} disabled={savingTutorDraft}>
              {savingTutorDraft && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Agregar tutor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type PersonaFormFieldsProps = {
  values: PersonaForm;
  onChange: (field: keyof PersonaForm, value: string) => void;
};

function PersonaFormFields({ values, onChange }: PersonaFormFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Datos personales
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              Nombre *
            </label>
            <Input
              value={values.nombre}
              onChange={(e) => onChange("nombre", e.target.value)}
              placeholder="Nombre"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              Apellido *
            </label>
            <Input
              value={values.apellido}
              onChange={(e) => onChange("apellido", e.target.value)}
              placeholder="Apellido"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              DNI *
            </label>
            <Input
              value={values.dni}
              inputMode="numeric"
              pattern="\d*"
              minLength={7}
              maxLength={10}
              onChange={(e) => onChange("dni", formatDni(e.target.value))}
              placeholder="DNI"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              Fecha de nacimiento
            </label>
            <DatePicker
              max={maxBirthDate}
              value={values.fechaNacimiento || undefined}
              onChange={(value) => onChange("fechaNacimiento", value ?? "")}
              required
              showMonthDropdown
              showYearDropdown
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              Género
            </label>
            <Select
              value={values.genero || undefined}
              onValueChange={(value) => onChange("genero", value)}
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
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              Estado civil
            </label>
            <Input
              value={values.estadoCivil}
              onChange={(e) => onChange("estadoCivil", e.target.value)}
              placeholder="Soltero, casado, etc."
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              Nacionalidad
            </label>
            <Input
              value={values.nacionalidad}
              onChange={(e) => onChange("nacionalidad", e.target.value)}
              placeholder="Argentina, peruana, etc."
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Datos de contacto
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2 space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              Domicilio
            </label>
            <Input
              value={values.domicilio}
              onChange={(e) => onChange("domicilio", e.target.value)}
              placeholder="Calle, número y localidad"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              Teléfono
            </label>
            <Input
              value={values.telefono}
              onChange={(e) => onChange("telefono", e.target.value)}
              placeholder="Teléfono fijo"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              Celular
            </label>
            <Input
              value={values.celular}
              onChange={(e) => onChange("celular", e.target.value)}
              placeholder="Número móvil"
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="text-sm font-medium text-muted-foreground">
              Email
            </label>
            <Input
              type="email"
              value={values.email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
