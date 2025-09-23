"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  calendario,
  gestionAcademica,
  identidad,
  vidaEscolar,
} from "@/services/api/modules";
import { isBirthDateValid, maxBirthDate } from "@/lib/form-utils";
import type * as DTO from "@/types/api-generated";
import { formatDni } from "@/lib/form-utils";
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
import { Loader2 } from "lucide-react";

const emptyPersona: PersonaForm = {
  nombre: "",
  apellido: "",
  dni: "",
  fechaNacimiento: "",
  genero: "",
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
  const [personaPreview, setPersonaPreview] = useState<DTO.PersonaDTO | null>(null);
  const [personaForm, setPersonaForm] = useState<PersonaForm>(emptyPersona);
  const [dniLookupLoading, setDniLookupLoading] = useState(false);
  const [lastLookupDni, setLastLookupDni] = useState<string>("");

  const [alumnoForm, setAlumnoForm] = useState<AlumnoForm>(emptyAlumno);
  const [creatingAlumno, setCreatingAlumno] = useState(false);
  const [secciones, setSecciones] = useState<DTO.SeccionDTO[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await gestionAcademica.secciones.list();
        setSecciones(res.data ?? []);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

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
        genero: data.genero ?? "",
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
    setCreatingAlumno(true);
    try {
      const personaPersistidaId = await persistPersona();
      setPersonaId(personaPersistidaId);

      const payload: DTO.AlumnoDTO = {
        personaId: personaPersistidaId,
        fechaInscripcion: alumnoForm.fechaInscripcion || undefined,
        observacionesGenerales: alumnoForm.observacionesGenerales || undefined,
        motivoRechazoBaja: alumnoForm.motivoRechazoBaja || undefined,
      };
      const { data: alumnoId } = await identidad.alumnos.create(payload);
      const matriculaPayload: DTO.MatriculaCreateDTO = {
        alumnoId,
        periodoEscolarId: await obtenerPeriodoEscolarActual(),
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

  const obtenerPeriodoEscolarActual = async (): Promise<number> => {
    try {
      const res = await calendario.periodos.list();
      const activos = res.data?.filter((p) => p.activo) ?? [];
      if (activos.length > 0) return activos[0].id!;
      if (res.data?.length) return res.data[0].id!;
      throw new Error("No hay período escolar registrado");
    } catch (error: any) {
      toast.error(error?.message ?? "No se pudo obtener el período escolar activo");
      throw error;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-4 md:p-8">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/alumnos")}
        >
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
            <CardTitle>Datos de la persona</CardTitle>
            <CardDescription>
              Ingresá los datos básicos. Si el DNI ya está registrado, se completarán automáticamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
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
              {personaId && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Persona existente detectada (ID #{personaId}). Actualizá los datos si es necesario.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Datos del alumno</CardTitle>
            <CardDescription>
              Podés completar observaciones internas o la fecha de inscripción.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Fecha de inscripción
                </label>
                <Input
                  type="date"
                  value={alumnoForm.fechaInscripcion}
                  onChange={(e) =>
                  setAlumnoForm((prev) => ({ ...prev, fechaInscripcion: e.target.value }))
                }
              />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                Motivo de rechazo (opcional)
                </label>
                <Input
                  value={alumnoForm.motivoRechazoBaja}
                  onChange={(e) =>
                    setAlumnoForm((prev) => ({ ...prev, motivoRechazoBaja: e.target.value }))
                  }
                  placeholder="Si es un reingreso u observación particular"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Sección
                </label>
                <select
                  value={alumnoForm.seccionId}
                  onChange={(e) =>
                    setAlumnoForm((prev) => ({ ...prev, seccionId: e.target.value }))
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Seleccioná...</option>
                  {secciones.map((sec) => (
                    <option key={sec.id} value={sec.id}
                    >
                      {sec.nivel} — {sec.gradoSala} {sec.division} ({sec.turno})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Observaciones
              </label>
              <Textarea
                rows={4}
                value={alumnoForm.observacionesGenerales}
                onChange={(e) =>
                  setAlumnoForm((prev) => ({ ...prev, observacionesGenerales: e.target.value }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/alumnos")}>Cancelar</Button>
         <Button
           onClick={handleCrearAlumno}
           disabled={creatingAlumno || !personaId}
         >
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
    <div className="grid gap-3 md:grid-cols-2">
      <div>
        <label className="text-sm font-medium text-muted-foreground">Nombre *</label>
        <Input
          value={values.nombre}
          onChange={(e) => onChange("nombre", e.target.value)}
          placeholder="Nombre"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Apellido *</label>
        <Input
          value={values.apellido}
          onChange={(e) => onChange("apellido", e.target.value)}
          placeholder="Apellido"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">DNI *</label>
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
      <div>
        <label className="text-sm font-medium text-muted-foreground">Fecha de nacimiento</label>
        <Input
          type="date"
          max={maxBirthDate}
          value={values.fechaNacimiento}
          onChange={(e) => onChange("fechaNacimiento", e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Género</label>
        <Input
          value={values.genero}
          onChange={(e) => onChange("genero", e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Estado civil</label>
        <Input
          value={values.estadoCivil}
          onChange={(e) => onChange("estadoCivil", e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Nacionalidad</label>
        <Input
          value={values.nacionalidad}
          onChange={(e) => onChange("nacionalidad", e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Domicilio</label>
        <Input
          value={values.domicilio}
          onChange={(e) => onChange("domicilio", e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
        <Input
          value={values.telefono}
          onChange={(e) => onChange("telefono", e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Celular</label>
        <Input
          value={values.celular}
          onChange={(e) => onChange("celular", e.target.value)}
        />
      </div>
      <div className="md:col-span-2">
        <label className="text-sm font-medium text-muted-foreground">Email</label>
        <Input
          type="email"
          value={values.email}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="correo@ejemplo.com"
        />
      </div>
    </div>
  );
}

  const handleAsignarSeccion = async (matriculaId: number) => {
    if (!alumnoForm.seccionId) return;
    try {
      await vidaEscolar.matriculaSeccionHistorial.create({
        matriculaId,
        seccionId: Number(alumnoForm.seccionId),
        desde: alumnoForm.fechaInscripcion || new Date().toISOString().slice(0, 10),
      });
    } catch (error: any) {
      toast.error(error?.message ?? "No se pudo asignar la sección");
    }
  };
