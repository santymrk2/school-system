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
import { DashboardLayout } from "@/app/dashboard/dashboard-layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
  const [creatingAlumno, setCreatingAlumno] = useState(false);
  const [secciones, setSecciones] = useState<DTO.SeccionDTO[]>([]);
  const { periodoEscolarId: activePeriodId } = useActivePeriod();

  const canSubmit = useMemo(() => {
    const nombreOk = Boolean(personaForm.nombre.trim());
    const apellidoOk = Boolean(personaForm.apellido.trim());
    const dniOk = formatDni(personaForm.dni).length >= 7;
    const seccionOk = Boolean(alumnoForm.seccionId);
    return nombreOk && apellidoOk && dniOk && seccionOk;
  }, [
    personaForm.nombre,
    personaForm.apellido,
    personaForm.dni,
    alumnoForm.seccionId,
  ]);

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
        console.error(error);
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
      console.error(error);
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
            console.error(error);
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
      toast.success("Alumno matriculado correctamente");
      router.push(`/dashboard/alumnos/${alumnoId}`);
    } catch (error: any) {
      toast.error(error?.message ?? "No se pudo registrar el alumno");
    } finally {
      setCreatingAlumno(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-4 md:p-8">
        <Button variant="outline" onClick={() => router.push("/dashboard/alumnos")}>
          Volver
        </Button>
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
                <Input
                  type="date"
                  value={alumnoForm.fechaInscripcion}
                  onChange={(e) =>
                    setAlumnoForm((prev) => ({
                      ...prev,
                      fechaInscripcion: e.target.value,
                    }))
                  }
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

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/alumnos")}>
            Cancelar
          </Button>
          <Button onClick={handleCrearAlumno} disabled={creatingAlumno || !canSubmit}>
            {creatingAlumno && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Registrar alumno
          </Button>
        </div>
      </div>
    </DashboardLayout>
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
            <Input
              type="date"
              max={maxBirthDate}
              value={values.fechaNacimiento}
              onChange={(e) => onChange("fechaNacimiento", e.target.value)}
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
