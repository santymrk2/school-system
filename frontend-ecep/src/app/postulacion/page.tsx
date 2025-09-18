// app/postulacion/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { api } from "@/services/api"; // ← import del cliente API
import * as DTO from "@/types/api-generated";

import { Step1 } from "./Step1";
import { Step2 } from "./Step2";
import { Step3 } from "./Step3";
import { Step4 } from "./Step4";
import { Step5 } from "./Step5";
import type {
  PostulacionFormData,
  FamiliarForm,
  FamiliarPersonaForm,
} from "./types";

const emptyFamiliarPersona: FamiliarPersonaForm = {
  personaId: null,
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
  emailContacto: "",
  lugarTrabajo: "",
  ocupacion: "",
};

const createEmptyFamiliar = (): FamiliarForm => ({
  id: undefined,
  tipoRelacion: DTO.RolVinculo.PADRE,
  viveConAlumno: true,
  familiar: { ...emptyFamiliarPersona },
});

const initialFormData: PostulacionFormData = {
  personaId: null,
  nombre: "",
  apellido: "",
  dni: "",
  fechaNacimiento: "",
  cursoSolicitado: undefined,
  turnoPreferido: undefined,
  escuelaActual: "",
  domicilio: "",
  nacionalidad: "",
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
  familiares: [],
};

type PersonaInput = {
  personaId?: number | null;
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento?: string;
  genero?: string;
  estadoCivil?: string;
  nacionalidad?: string;
  domicilio?: string;
  telefono?: string;
  celular?: string;
  email?: string;
};

export default function PostulacionPage() {
  const totalSteps = 5;
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PostulacionFormData>(initialFormData);
  const [aspirantePersonaPreview, setAspirantePersonaPreview] =
    useState<DTO.PersonaDTO | null>(null);
  const [dniLookupLoading, setDniLookupLoading] = useState(false);
  const [lastLookupDni, setLastLookupDni] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [communicationsAuthorized, setCommunicationsAuthorized] =
    useState(false);
  const { toast } = useToast();

  const handleInputChange = (
    field: string,
    value: any,
    options?: { errorKeys?: string | string[] },
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "dni" ? { personaId: null } : {}),
    }));
    if (field === "dni") {
      setAspirantePersonaPreview(null);
      setLastLookupDni("");
    }
    setErrors((prev) => {
      if (!Object.keys(prev).length) return prev;
      const keys = options?.errorKeys
        ? Array.isArray(options.errorKeys)
          ? options.errorKeys
          : [options.errorKeys]
        : [];
      const next = { ...prev };
      delete next[field];
      for (const key of keys) {
        if (key) {
          delete next[key];
        }
      }
      return next;
    });
  };

  useEffect(() => {
    const dni = (formData.dni ?? "").trim();
    if (!dni || dni.length < 7) {
      setDniLookupLoading(false);
      return;
    }
    if (aspirantePersonaPreview?.dni === dni || lastLookupDni === dni) {
      return;
    }

    setDniLookupLoading(true);
    let cancelled = false;
    const handle = setTimeout(async () => {
      try {
        const { data: personaId } = await api.personasCore.findIdByDni(dni);
        if (cancelled) return;
        const { data: persona } = await api.personasCore.getById(Number(personaId));
        if (cancelled) return;
        setAspirantePersonaPreview(persona);
        setFormData((prev) => ({
          ...prev,
          personaId: persona.id ?? prev.personaId ?? null,
          nombre: prev.nombre || persona.nombre || "",
          apellido: prev.apellido || persona.apellido || "",
          fechaNacimiento: prev.fechaNacimiento || persona.fechaNacimiento || "",
          domicilio: prev.domicilio || persona.domicilio || "",
          nacionalidad: prev.nacionalidad || persona.nacionalidad || "",
        }));
        setLastLookupDni(dni);
      } catch (error: any) {
        if (cancelled) return;
        if (error?.response?.status === 404) {
          setAspirantePersonaPreview(null);
          setFormData((prev) => ({ ...prev, personaId: null }));
          setLastLookupDni(dni);
        } else {
          console.error(error);
        }
      } finally {
        if (!cancelled) setDniLookupLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [formData.dni, aspirantePersonaPreview, lastLookupDni]);

  const buildPersonaPayload = (input: PersonaInput): DTO.PersonaCreateDTO => ({
    nombre: input.nombre,
    apellido: input.apellido,
    dni: input.dni,
    fechaNacimiento: input.fechaNacimiento || undefined,
    genero: input.genero || undefined,
    estadoCivil: input.estadoCivil || undefined,
    nacionalidad: input.nacionalidad || undefined,
    domicilio: input.domicilio || undefined,
    telefono: input.telefono || undefined,
    celular: input.celular || undefined,
    email: input.email || undefined,
  });

  const upsertPersona = async (input: PersonaInput): Promise<number> => {
    const payload = buildPersonaPayload(input);
    if (input.personaId) {
      await api.personasCore.update(input.personaId, payload);
      return input.personaId;
    }
    try {
      const { data } = await api.personasCore.create(payload);
      return Number(data);
    } catch (error: any) {
      if (error?.response?.status === 400 || error?.response?.status === 409) {
        const { data } = await api.personasCore.findIdByDni(input.dni);
        const id = Number(data);
        await api.personasCore.update(id, payload);
        return id;
      }
      throw error;
    }
  };

  const ensureAspiranteRecord = async (personaId: number): Promise<number> => {
    const payload: DTO.AspiranteDTO = {
      personaId,
      cursoSolicitado: formData.cursoSolicitado as DTO.Curso | undefined,
      turnoPreferido: formData.turnoPreferido as DTO.Turno | undefined,
      escuelaActual: formData.escuelaActual || undefined,
      conectividadInternet: formData.conectividadInternet || undefined,
      dispositivosDisponibles: formData.dispositivosDisponibles || undefined,
      idiomasHabladosHogar: formData.idiomasHabladosHogar || undefined,
      enfermedadesAlergias: formData.enfermedadesAlergias || undefined,
      medicacionHabitual: formData.medicacionHabitual || undefined,
      limitacionesFisicas: formData.limitacionesFisicasNeurologicas || undefined,
      tratamientosTerapeuticos: formData.tratamientosTerapeuticos || undefined,
      usoAyudasMovilidad: formData.usoAyudasMovilidad,
      coberturaMedica: formData.coberturaMedica || undefined,
      observacionesSalud: formData.observacionesAdicionalesSalud || undefined,
    };

    try {
      const { data } = await api.aspirantes.byId(personaId);
      await api.aspirantes.update(personaId, payload);
      return data?.id ?? personaId;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        const { data } = await api.aspirantes.create(payload);
        return data?.id ?? personaId;
      }
      throw error;
    }
  };

  const ensureFamiliarRecord = async (
    personaId: number,
    ocupacion?: string,
  ): Promise<number> => {
    const payload: DTO.FamiliarDTO = {
      id: personaId,
      personaId,
      ocupacion,
    };

    try {
      const { data } = await api.familiares.byId(personaId);
      await api.familiares.update(personaId, payload);
      return data?.id ?? personaId;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        const { data } = await api.familiares.create({ personaId, ocupacion });
        return Number(data);
      }
      throw error;
    }
  };

  const linkAspiranteFamiliar = async (
    aspiranteId: number,
    familiarId: number,
    parentesco: string,
    convive: boolean,
  ) => {
    try {
      await api.aspiranteFamiliares.create({
        aspiranteId,
        familiarId,
        parentesco,
        convive,
      } as DTO.AspiranteFamiliarDTO);
    } catch (error: any) {
      if (error?.response?.status && [400, 409].includes(error.response.status)) {
        return;
      }
      throw error;
    }
  };

  const addFamiliar = () => {
    setFormData((prev) => ({
      ...prev,
      familiares: [...prev.familiares, createEmptyFamiliar()],
    }));
    setErrors((prev) => {
      if (!prev.familiares) return prev;
      const next = { ...prev };
      delete next.familiares;
      return next;
    });
  };

  const isValidRolVinculo = (value?: string | null): value is DTO.RolVinculo => {
    if (!value) return false;
    return (Object.values(DTO.RolVinculo) as string[]).includes(value);
  };

  const validateStep1 = () => {
    const fields = [
      "nombre",
      "apellido",
      "dni",
      "fechaNacimiento",
      "cursoSolicitado",
      "turnoPreferido",
    ];
    const newErrors: Record<string, boolean> = {};
    let ok = true;
    for (const f of fields) {
      if (!formData[f as keyof typeof formData]) {
        newErrors[f] = true;
        ok = false;
      }
    }
    setErrors(newErrors);
    if (!ok) {
      toast({
        title: "Completa los campos obligatorios.",
        variant: "destructive",
      });
    }
    return ok;
  };

  const validateStep2 = () => {
    const familiares = formData.familiares ?? [];
    const newErrors: Record<string, boolean> = {};
    let ok = true;

    if (!familiares.length) {
      newErrors.familiares = true;
      ok = false;
    }

    familiares.forEach((familiarEntry, index) => {
      if (!isValidRolVinculo(familiarEntry.tipoRelacion)) {
        newErrors[`familiares.${index}.tipoRelacion`] = true;
        ok = false;
      }
      const familiarPersona = familiarEntry.familiar;
      const nombre = familiarPersona?.nombre?.trim();
      if (!nombre) {
        newErrors[`familiares.${index}.familiar.nombre`] = true;
        ok = false;
      }
      const apellido = familiarPersona?.apellido?.trim();
      if (!apellido) {
        newErrors[`familiares.${index}.familiar.apellido`] = true;
        ok = false;
      }
      const dni = familiarPersona?.dni?.trim();
      if (!dni || dni.length < 7) {
        newErrors[`familiares.${index}.familiar.dni`] = true;
        ok = false;
      }
      const email = familiarPersona?.emailContacto?.trim();
      if (!email) {
        newErrors[`familiares.${index}.familiar.emailContacto`] = true;
        ok = false;
      }
    });

    setErrors(newErrors);
    if (!ok) {
      toast({
        title: "Completá los datos de al menos un familiar.",
        description:
          "Ingresá nombre, apellido, DNI y un email de contacto para continuar.",
        variant: "destructive",
      });
    }
    return ok;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, boolean> = {};
    let ok = true;
    if (!(formData.conectividadInternet ?? "").trim()) {
      newErrors.conectividadInternet = true;
      ok = false;
    }
    if (!(formData.dispositivosDisponibles ?? "").trim()) {
      newErrors.dispositivosDisponibles = true;
      ok = false;
    }
    if (!(formData.idiomasHabladosHogar ?? "").trim()) {
      newErrors.idiomasHabladosHogar = true;
      ok = false;
    }
    setErrors(newErrors);
    if (!ok) {
      toast({
        title: "Completá la información del hogar.",
        description:
          "Seleccioná la conectividad y detallá dispositivos e idiomas hablados.",
        variant: "destructive",
      });
    }
    return ok;
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return validateStep1();
      case 2:
        return validateStep2();
      case 3:
        return validateStep3();
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateCurrentStep()) return;
    setCurrentStep((s) => Math.min(s + 1, totalSteps));
  };
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!communicationsAuthorized) {
      toast({
        title: "Debes autorizar comunicaciones por email.",
        variant: "destructive",
      });
      return;
    }

    try {
      const aspirantePersonaId = await upsertPersona({
        personaId: formData.personaId,
        nombre: (formData.nombre ?? "").trim(),
        apellido: (formData.apellido ?? "").trim(),
        dni: (formData.dni ?? "").trim(),
        fechaNacimiento: formData.fechaNacimiento || undefined,
        nacionalidad: formData.nacionalidad || undefined,
        domicilio: formData.domicilio || undefined,
      });
      setFormData((prev) => ({ ...prev, personaId: aspirantePersonaId }));

      const aspiranteId = await ensureAspiranteRecord(aspirantePersonaId);

      for (const familiarEntry of formData.familiares) {
        const familiarPersona = familiarEntry.familiar;
        if (
          !familiarPersona ||
          !familiarPersona.dni ||
          !familiarPersona.nombre ||
          !familiarPersona.apellido
        ) {
          continue;
        }

        const familiarPersonaId = await upsertPersona({
          personaId: familiarPersona.personaId,
          nombre: familiarPersona.nombre.trim(),
          apellido: familiarPersona.apellido.trim(),
          dni: familiarPersona.dni.trim(),
          fechaNacimiento: familiarPersona.fechaNacimiento || undefined,
          genero: familiarPersona.genero || undefined,
          estadoCivil: familiarPersona.estadoCivil || undefined,
          nacionalidad: familiarPersona.nacionalidad || undefined,
          domicilio: familiarPersona.domicilio || undefined,
          telefono: familiarPersona.telefono || undefined,
          celular: familiarPersona.celular || undefined,
          email:
            familiarPersona.emailContacto?.trim() ||
            familiarPersona.email?.trim() ||
            undefined,
        });

        await ensureFamiliarRecord(
          familiarPersonaId,
          familiarPersona.ocupacion || undefined,
        );

        const parentesco = isValidRolVinculo(familiarEntry.tipoRelacion)
          ? familiarEntry.tipoRelacion
          : DTO.RolVinculo.OTRO;
        await linkAspiranteFamiliar(
          aspiranteId,
          familiarPersonaId,
          parentesco,
          familiarEntry.viveConAlumno ?? false,
        );
      }

      const solicitudPayload: DTO.SolicitudAdmisionDTO = {
        aspiranteId,
        estado: "PENDIENTE",
        emailConfirmacionEnviado: communicationsAuthorized,
        entrevistaRealizada: false,
      };
      await api.solicitudesAdmision.create(solicitudPayload);

      toast({ title: "Postulación enviada con éxito.", variant: "default" });

      setFormData({ ...initialFormData, familiares: [] });
      setAspirantePersonaPreview(null);
      setLastLookupDni("");
      setCommunicationsAuthorized(false);
      setErrors({});
      setCurrentStep(1);
    } catch (err: any) {
      console.error(err);
      toast({
        title: `Error al enviar: ${err?.message ?? "No se pudo enviar"}`,
        variant: "destructive",
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
            personaDetectadaId={formData.personaId ?? aspirantePersonaPreview?.id ?? null}
            dniLookupLoading={dniLookupLoading}
          />
        );
      case 2:
        return (
          <Step2
            formData={formData}
            handleInputChange={handleInputChange}
            addFamiliar={addFamiliar}
            errors={errors}
          />
        );
      case 3:
        return (
          <Step3
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
          />
        );
      case 4:
        return (
          <Step4 formData={formData} handleInputChange={handleInputChange} />
        );
      case 5:
        return (
          <Step5
            formData={formData}
            communicationsAuthorized={communicationsAuthorized}
            setCommunicationsAuthorized={setCommunicationsAuthorized}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-primary mb-4 hover:text-primary/80"
        >
          Volver
        </Link>
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Postulación de Alumno
          </h1>
          <p className="text-gray-600">Escuela Complejo Evangélico Pilar</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>
              Paso {currentStep} de {totalSteps}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStep()}

            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
              ) : (
                <div className="w-32" />
              )}

              {currentStep < totalSteps ? (
                <Button onClick={nextStep}>
                  Siguiente
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!communicationsAuthorized}
                >
                  Enviar Postulación
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
