// app/postulacion/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDni } from "@/lib/form-utils";
import { admisiones, identidad } from "@/services/api/modules"; // ← módulos API
import { BASE } from "@/services/api/http";
import * as DTO from "@/types/api-generated";
import { isBirthDateValid } from "@/lib/form-utils";

import { Step1 } from "./Step1";
import { Step2 } from "./Step2";
import { Step3 } from "./Step3";
import { Step4 } from "./Step4";
import { Step5 } from "./Step5";
import { ExistingFamiliarDialog } from "./ExistingFamiliarDialog";
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

type FamiliarRecordDTO = DTO.FamiliarDTO & { ocupacion?: string | null };

type FamiliarPromptInfo = {
  index: number;
  dni: string;
  persona: DTO.PersonaDTO;
  familiar?: FamiliarRecordDTO | null;
};

type FamiliarLookupState = {
  dni: string;
  status: "pending" | "prompted" | "completed" | "notfound";
};

const buildSolicitudObservaciones = (
  data: PostulacionFormData,
): string | undefined => {
  const lines: string[] = [];
  lines.push("Resumen generado automáticamente desde el formulario web.");
  if (data.escuelaActual) {
    lines.push(`Escuela actual: ${data.escuelaActual}`);
  }
  if (data.conectividadInternet) {
    lines.push(`Conectividad en el hogar: ${data.conectividadInternet}`);
  }
  if (data.dispositivosDisponibles) {
    lines.push(`Dispositivos disponibles: ${data.dispositivosDisponibles}`);
  }
  if (data.idiomasHabladosHogar) {
    lines.push(`Idiomas hablados en el hogar: ${data.idiomasHabladosHogar}`);
  }
  if (data.enfermedadesAlergias) {
    lines.push(`Enfermedades o alergias: ${data.enfermedadesAlergias}`);
  }
  if (data.medicacionHabitual) {
    lines.push(`Medicación habitual: ${data.medicacionHabitual}`);
  }
  if (data.limitacionesFisicasNeurologicas) {
    lines.push(
      `Limitaciones físicas o neurológicas: ${data.limitacionesFisicasNeurologicas}`,
    );
  }
  if (data.tratamientosTerapeuticos) {
    lines.push(
      `Tratamientos terapéuticos en curso: ${data.tratamientosTerapeuticos}`,
    );
  }
  if (data.usoAyudasMovilidad) {
    lines.push("Utiliza ayudas de movilidad.");
  }
  if (data.coberturaMedica) {
    lines.push(`Cobertura médica: ${data.coberturaMedica}`);
  }
  if (data.observacionesAdicionalesSalud) {
    lines.push(
      `Observaciones adicionales de salud: ${data.observacionesAdicionalesSalud}`,
    );
  }
  return lines.filter(Boolean).join("\n") || undefined;
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
  const familiarLookupState = useRef<Record<number, FamiliarLookupState>>({});
  const familiarPromptQueue = useRef<FamiliarPromptInfo[]>([]);
  const [existingFamiliarPrompt, setExistingFamiliarPrompt] =
    useState<FamiliarPromptInfo | null>(null);
  const [familiarAuthLoading, setFamiliarAuthLoading] = useState(false);
  const [familiarAuthError, setFamiliarAuthError] = useState<string | null>(
    null,
  );
  const activePromptRef = useRef<FamiliarPromptInfo | null>(null);

  useEffect(() => {
    activePromptRef.current = existingFamiliarPrompt;
  }, [existingFamiliarPrompt]);

  useEffect(() => {
    if (existingFamiliarPrompt) {
      setFamiliarAuthError(null);
    }
  }, [existingFamiliarPrompt]);
  const handleInputChange = (
    field: string,
    value: any,
    options?: { errorKeys?: string | string[] },
  ) => {
    const sanitizedValue =
      field === "dni" && typeof value === "string" ? formatDni(value) : value;
    setFormData((prev) => ({
      ...prev,
      [field]: sanitizedValue,
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
    const dni = formatDni(formData.dni ?? "");
    if (!dni || dni.length < 7 || dni.length > 10) {
      setDniLookupLoading(false);
      return;
    }
    const previewDni = aspirantePersonaPreview?.dni
      ? formatDni(aspirantePersonaPreview.dni)
      : "";
    if (previewDni === dni || lastLookupDni === dni) {
      return;
    }

    setDniLookupLoading(true);
    let cancelled = false;
    const handle = setTimeout(async () => {
      try {
        const { data: personaId } = await identidad.personasCore.findIdByDni(dni);
        if (cancelled) return;
        const { data: persona } = await identidad.personasCore.getById(
          Number(personaId),
        );
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

  useEffect(() => {
    const familiares = formData.familiares ?? [];
    const cancelers: Array<() => void> = [];

    familiares.forEach((familiarEntry, index) => {
      const dni = formatDni(familiarEntry.familiar?.dni ?? "");
      if (!dni || dni.length < 7) {
        delete familiarLookupState.current[index];
        return;
      }

      const currentState = familiarLookupState.current[index];
      if (currentState && currentState.dni === dni && currentState.status !== "pending") {
        return;
      }

      familiarLookupState.current[index] = { dni, status: "pending" };
      let cancelled = false;
      cancelers.push(() => {
        cancelled = true;
      });

      (async () => {
        try {
          const { data: personaId } = await identidad.personasCore.findIdByDni(dni);
          if (cancelled) return;
          if (!personaId) {
            familiarLookupState.current[index] = { dni, status: "notfound" };
            return;
          }

          const personaPromise = identidad.personasCore.getById(Number(personaId));
          const familiarPromise = identidad.familiares
            .byId(Number(personaId))
            .catch(() => null);
          const [personaRes, familiarRes] = await Promise.all([
            personaPromise,
            familiarPromise,
          ]);
          if (cancelled) return;

          const info: FamiliarPromptInfo = {
            index,
            dni,
            persona: personaRes.data,
            familiar:
              (familiarRes?.data as FamiliarRecordDTO | undefined) ?? null,
          };
          familiarLookupState.current[index] = { dni, status: "prompted" };
          if (activePromptRef.current) {
            familiarPromptQueue.current.push(info);
          } else {
            setExistingFamiliarPrompt(info);
          }
        } catch (error: any) {
          if (cancelled) return;
          if (error?.response?.status === 404) {
            familiarLookupState.current[index] = { dni, status: "notfound" };
          } else {
            console.error(error);
            familiarLookupState.current[index] = { dni, status: "notfound" };
          }
        }
      })();
    });

    return () => {
      cancelers.forEach((cancel) => cancel());
    };
  }, [formData.familiares]);

  const applyFamiliarData = (
    index: number,
    persona: DTO.PersonaDTO,
    familiar?: FamiliarRecordDTO | null,
  ) => {
    setFormData((prev) => {
      const familiares = [...(prev.familiares ?? [])];
      if (!familiares[index]) return prev;
      const current = familiares[index];
      const basePersona = current.familiar ?? { ...emptyFamiliarPersona };
      const updated = {
        ...current,
        id: familiar?.id ?? current.id,
        familiar: {
          ...basePersona,
          personaId: persona.id ?? basePersona.personaId ?? null,
          nombre: persona.nombre ?? "",
          apellido: persona.apellido ?? "",
          dni: formatDni(persona.dni ?? basePersona.dni ?? ""),
          fechaNacimiento: persona.fechaNacimiento ?? basePersona.fechaNacimiento ?? "",
          genero: persona.genero ?? basePersona.genero ?? "",
          estadoCivil: persona.estadoCivil ?? basePersona.estadoCivil ?? "",
          nacionalidad: persona.nacionalidad ?? basePersona.nacionalidad ?? "",
          domicilio: persona.domicilio ?? basePersona.domicilio ?? "",
          telefono: persona.telefono ?? basePersona.telefono ?? "",
          celular: persona.celular ?? basePersona.celular ?? "",
          email: persona.email ?? basePersona.email ?? "",
          emailContacto: persona.email ?? basePersona.emailContacto ?? "",
          lugarTrabajo: basePersona.lugarTrabajo ?? "",
          ocupacion: familiar?.ocupacion ?? basePersona.ocupacion ?? "",
        },
      };
      familiares[index] = updated;
      return {
        ...prev,
        familiares,
      };
    });

    setErrors((prev) => {
      if (!Object.keys(prev).length) return prev;
      const next = { ...prev };
      const keysToClear = [
        `familiares.${index}.tipoRelacion`,
        `familiares.${index}.familiar.nombre`,
        `familiares.${index}.familiar.apellido`,
        `familiares.${index}.familiar.dni`,
        `familiares.${index}.familiar.fechaNacimiento`,
        `familiares.${index}.familiar.emailContacto`,
      ];
      keysToClear.forEach((key) => {
        if (key in next) delete next[key];
      });
      return next;
    });
  };

  const showNextPrompt = () => {
    const next = familiarPromptQueue.current.shift() ?? null;
    if (next) {
      setExistingFamiliarPrompt(next);
    }
  };

  const handleExistingFamiliarCancel = () => {
    const active = activePromptRef.current;
    if (!active) return;
    familiarLookupState.current[active.index] = {
      dni: active.dni,
      status: "completed",
    };
    setExistingFamiliarPrompt(null);
    setFamiliarAuthError(null);
    setFamiliarAuthLoading(false);
    showNextPrompt();
  };

  const handleExistingFamiliarConfirm = async (
    email: string,
    password: string,
  ) => {
    const active = activePromptRef.current;
    if (!active) return;
    setFamiliarAuthLoading(true);
    setFamiliarAuthError(null);
    try {
      const response = await fetch(`${BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "omit",
      });
      if (!response.ok) {
        let message = "No se pudo validar las credenciales.";
        try {
          const payload = await response.json();
          if (payload?.message) {
            message = payload.message;
          }
        } catch {}
        throw new Error(message);
      }

      applyFamiliarData(active.index, active.persona, active.familiar ?? null);
      toast.success("Datos del familiar completados automáticamente.");
      familiarLookupState.current[active.index] = {
        dni: active.dni,
        status: "completed",
      };
      setExistingFamiliarPrompt(null);
      showNextPrompt();
    } catch (error: any) {
      const message = error?.message ?? "Credenciales inválidas.";
      setFamiliarAuthError(message);
      toast.error(message);
    } finally {
      setFamiliarAuthLoading(false);
    }
  };

  const buildPersonaPayload = (input: PersonaInput): DTO.PersonaCreateDTO => {
    const dni = formatDni(input.dni);
    return {
      nombre: input.nombre,
      apellido: input.apellido,
      dni,
      fechaNacimiento: input.fechaNacimiento || undefined,
      genero: input.genero || undefined,
      estadoCivil: input.estadoCivil || undefined,
      nacionalidad: input.nacionalidad || undefined,
      domicilio: input.domicilio || undefined,
      telefono: input.telefono || undefined,
      celular: input.celular || undefined,
      email: input.email || undefined,
    };
  };

  const upsertPersona = async (input: PersonaInput): Promise<number> => {
    const payload = buildPersonaPayload(input);
    if (!payload.dni || payload.dni.length < 7 || payload.dni.length > 10) {
      throw new Error("El DNI debe tener entre 7 y 10 dígitos.");
    }
    if (input.personaId) {
      await identidad.personasCore.update(input.personaId, payload);
      return input.personaId;
    }
    try {
    const { data } = await identidad.personasCore.create(payload);
      return Number(data);
    } catch (error: any) {
      if (error?.response?.status === 400 || error?.response?.status === 409) {
        const { data } = await identidad.personasCore.findIdByDni(input.dni);
        const id = Number(data);
        await identidad.personasCore.update(id, payload);
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
      const { data } = await admisiones.aspirantes.byPersonaId(personaId);
      const aspiranteId = data?.id;
      if (aspiranteId == null) {
        throw new Error("No se pudo determinar el ID del aspirante.");
      }
      await admisiones.aspirantes.update(aspiranteId, payload);
      return aspiranteId;
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        throw error;
      }
    }

    const { data } = await admisiones.aspirantes.create(payload);
    return data?.id ?? personaId;
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
      const { data } = await identidad.familiares.byId(personaId);
      await identidad.familiares.update(personaId, payload);
      return data?.id ?? personaId;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        const { data } = await identidad.familiares.create({ personaId, ocupacion });
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
      await admisiones.aspiranteFamiliares.create({
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
    let missingRequired = false;
    let invalidBirthDate = false;
    for (const f of fields) {
      if (!formData[f as keyof typeof formData]) {
        newErrors[f] = true;
        ok = false;
        missingRequired = true;
      }
    }
    const dniValue = formatDni(formData.dni ?? "");
    const dniInvalid = !dniValue || dniValue.length < 7 || dniValue.length > 10;
    if (dniInvalid) {
      newErrors.dni = true;
      ok = false;
    }

    const birthDate = formData.fechaNacimiento;
    if (birthDate && !isBirthDateValid(birthDate)) {
      newErrors.fechaNacimiento = true;
      ok = false;
      invalidBirthDate = true;
    }

    setErrors(newErrors);
    if (!ok) {
      const description = [
        missingRequired ? "Completá los campos obligatorios." : null,
        invalidBirthDate
          ? "La fecha de nacimiento debe ser al menos dos años anterior a hoy."
          : null,
        dniInvalid ? "El DNI debe tener entre 7 y 10 dígitos." : null,
      ]
        .filter(Boolean)
        .join(" ");

      toast.error("Revisá los datos del aspirante.", {
        description: description || undefined,
      });
    }
    return ok;
  };

  const validateStep2 = () => {
    const familiares = formData.familiares ?? [];
    const newErrors: Record<string, boolean> = {};
    let ok = true;
    let invalidBirthDate = false;

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
      const dni = formatDni(familiarPersona?.dni ?? "");
      if (!dni || dni.length < 7 || dni.length > 10) {
        newErrors[`familiares.${index}.familiar.dni`] = true;
        ok = false;
      }
      const fechaNacimiento = familiarPersona?.fechaNacimiento?.trim();
      if (fechaNacimiento && !isBirthDateValid(fechaNacimiento)) {
        newErrors[`familiares.${index}.familiar.fechaNacimiento`] = true;
        ok = false;
        invalidBirthDate = true;
      }
      const email = familiarPersona?.emailContacto?.trim();
      if (!email) {
        newErrors[`familiares.${index}.familiar.emailContacto`] = true;
        ok = false;
      }
    });

    setErrors(newErrors);
    if (!ok) {
      const description = [
        "Ingresá nombre, apellido, DNI y un email de contacto para continuar.",
        invalidBirthDate
          ? "Revisá también la fecha de nacimiento: debe ser al menos dos años anterior a hoy."
          : null,
      ]
        .filter(Boolean)
        .join(" ");

      toast.error("Completá los datos de al menos un familiar.", {
        description: description || undefined,
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
      toast.error("Completá la información del hogar.", {
        description:
          "Seleccioná la conectividad y detallá dispositivos e idiomas hablados.",
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
      toast.error("Debes autorizar comunicaciones por email.");
      return;
    }

    if (formData.fechaNacimiento && !isBirthDateValid(formData.fechaNacimiento)) {
      toast.error("Fecha de nacimiento inválida", {
        description:
          "La fecha de nacimiento del aspirante debe ser al menos dos años anterior a hoy.",
      });
      return;
    }

    const familiaresInvalidos = (formData.familiares ?? []).some((familiar) => {
      const fecha = familiar.familiar?.fechaNacimiento?.trim();
      return fecha ? !isBirthDateValid(fecha) : false;
    });
    if (familiaresInvalidos) {
      toast.error("Fecha de nacimiento inválida", {
        description:
          "Verificá las fechas de nacimiento de los familiares: deben ser al menos dos años anteriores a hoy.",
      });
      return;
    }

    try {
      const aspirantePersonaId = await upsertPersona({
        personaId: formData.personaId,
        nombre: (formData.nombre ?? "").trim(),
        apellido: (formData.apellido ?? "").trim(),
        dni: formatDni(formData.dni ?? ""),
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
          dni: formatDni(familiarPersona.dni ?? ""),
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
        observaciones: buildSolicitudObservaciones(formData),
      };
      await admisiones.solicitudesAdmision.create(solicitudPayload);

      toast.success("Postulación enviada con éxito.");

      setFormData({ ...initialFormData, familiares: [] });
      setAspirantePersonaPreview(null);
      setLastLookupDni("");
      setCommunicationsAuthorized(false);
      setErrors({});
      setCurrentStep(1);
    } catch (err: any) {
      console.error(err);
      toast.error(`Error al enviar: ${err?.message ?? "No se pudo enviar"}`);
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
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 p-4 transition-colors"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="outline" asChild>
          <Link href="/">Volver</Link>
        </Button>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Postulación de Alumno
          </h1>
          <p className="text-muted-foreground">
            Escuela Complejo Evangélico Pilar
          </p>
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

      <ExistingFamiliarDialog
        open={!!existingFamiliarPrompt}
        persona={existingFamiliarPrompt?.persona}
        dni={existingFamiliarPrompt?.dni}
        loading={familiarAuthLoading}
        error={familiarAuthError}
        onConfirm={handleExistingFamiliarConfirm}
        onCancel={handleExistingFamiliarCancel}
      />
    </div>
  );
}
