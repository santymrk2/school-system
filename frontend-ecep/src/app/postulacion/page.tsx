// app/postulacion/page.tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDni, isBirthDateValid, onlyDigits } from "@/lib/form-utils";
import { admisiones, identidad } from "@/services/api/modules"; // ← módulos API
import { BASE } from "@/services/api/http";
import * as DTO from "@/types/api-generated";
import { logger } from "@/lib/logger";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BackButton } from "@/components/common/BackButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const postulacionLogger = logger.child({ module: "postulacion" });

const logPostulacionError = (error: unknown, message?: string) => {
  if (message) {
    postulacionLogger.error({ err: error }, message);
  } else {
    postulacionLogger.error({ err: error });
  }
};

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
  dniLocked: false,
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

const completionMessages = {
  title: "¡Gracias por completar la postulación!",
  body:
    "Gracias por inscribirte en nuestra comunidad educativa. En breve recibirás un correo electrónico con los próximos pasos e información relevante.",
  reminder:
    "Te invitamos a mantenerte atento a tu bandeja de entrada y revisar tu carpeta de correo no deseado.",
};

type FamiliarRecordDTO =
  DTO.FamiliarDTO & { ocupacion?: string | null; lugarTrabajo?: string | null };

type FamiliarPromptInfo = {
  index: number;
  dni: string;
  persona: DTO.PersonaDTO;
  familiar?: FamiliarRecordDTO | null;
  requiresCredentials: boolean;
};

type FamiliarLookupState = {
  dni: string;
  status: "pending" | "prompted" | "completed" | "notfound";
};

const DRAFT_STORAGE_KEY = "postulacionDraft";

type PostulacionDraft = {
  formData: PostulacionFormData;
  currentStep: number;
  communicationsAuthorized: boolean;
  updatedAt?: string;
};

const DNI_DUPLICADO_ERROR =
  "El DNI ingresado es incorrecto o ya fue registrado previamente.";

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
  const [dniDuplicate, setDniDuplicate] = useState(false);
  const [dniGateOpen, setDniGateOpen] = useState(false);
  const [dniGateCompleted, setDniGateCompleted] = useState(false);
  const [dniGateValue, setDniGateValue] = useState<string>("");
  const [, setDniGateError] = useState<string | null>(null);
  const [dniGateLoading, setDniGateLoading] = useState(false);
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
  const [submissionCompleted, setSubmissionCompleted] = useState(false);
  const activePromptRef = useRef<FamiliarPromptInfo | null>(null);
  const [pendingDraft, setPendingDraft] = useState<PostulacionDraft | null>(
    null,
  );
  const [draftPromptVisible, setDraftPromptVisible] = useState(false);
  const [draftReady, setDraftReady] = useState(false);

  const clearDraft = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (error) {
      logPostulacionError(error, "No se pudo limpiar el borrador almacenado.");
    }
  }, []);

  const showDniGateError = useCallback(
    (message: string) => {
      setDniGateError(message);
      toast.error(message);
    },
    [setDniGateError],
  );

  const resetFormState = useCallback(
    (options?: { openGate?: boolean }) => {
      setFormData({ ...initialFormData, familiares: [] });
      setAspirantePersonaPreview(null);
      setLastLookupDni("");
      setCommunicationsAuthorized(false);
      setErrors({});
      setCurrentStep(1);
      setSubmissionCompleted(false);
      setExistingFamiliarPrompt(null);
      setFamiliarAuthError(null);
      setFamiliarAuthLoading(false);
      familiarLookupState.current = {};
      familiarPromptQueue.current = [];
      activePromptRef.current = null;
      setPendingDraft(null);
      setDraftPromptVisible(false);
      setDniGateCompleted(false);
      setDniGateValue("");
      setDniGateError(null);
      setDniDuplicate(false);
      setDniGateLoading(false);
      setDniGateOpen(options?.openGate === false ? false : true);
    },
    [],
  );

  const restartDraftTracking = useCallback(() => {
    setDraftReady(false);
    setTimeout(() => setDraftReady(true), 0);
  }, []);

  useEffect(() => {
    activePromptRef.current = existingFamiliarPrompt;
  }, [existingFamiliarPrompt]);

  useEffect(() => {
    if (!draftReady) return;
    if (draftPromptVisible) return;
    if (submissionCompleted) return;
    if (dniGateCompleted) return;
    setDniGateOpen(true);
  }, [draftReady, draftPromptVisible, submissionCompleted, dniGateCompleted]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const rawDraft = window.localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!rawDraft) {
        setDraftReady(true);
        return;
      }
      const parsed = JSON.parse(rawDraft) as PostulacionDraft | null;
      if (
        parsed &&
        typeof parsed === "object" &&
        parsed.formData &&
        typeof parsed.currentStep === "number"
      ) {
        setPendingDraft({
          formData: {
            ...initialFormData,
            ...(parsed.formData ?? {}),
            familiares: parsed.formData?.familiares ?? [],
          },
          currentStep: parsed.currentStep,
          communicationsAuthorized: Boolean(parsed.communicationsAuthorized),
          updatedAt: parsed.updatedAt,
        });
        setDraftPromptVisible(true);
        return;
      }
    } catch (error) {
      logPostulacionError(error, "No se pudo recuperar el borrador almacenado.");
      clearDraft();
    }
    setDraftReady(true);
  }, [clearDraft]);

  useEffect(() => {
    if (!draftReady || submissionCompleted) return;
    if (typeof window === "undefined") return;

    const hasDraftContent = Boolean(
      formData.personaId ||
        (formData.nombre ?? "").trim() ||
        (formData.apellido ?? "").trim() ||
        formatDni(formData.dni ?? "") ||
        (formData.fechaNacimiento ?? "").trim() ||
        formData.cursoSolicitado ||
        formData.turnoPreferido ||
        (formData.escuelaActual ?? "").trim() ||
        (formData.domicilio ?? "").trim() ||
        (formData.nacionalidad ?? "").trim() ||
        (formData.conectividadInternet ?? "").trim() ||
        (formData.dispositivosDisponibles ?? "").trim() ||
        (formData.idiomasHabladosHogar ?? "").trim() ||
        (formData.enfermedadesAlergias ?? "").trim() ||
        (formData.medicacionHabitual ?? "").trim() ||
        (formData.limitacionesFisicasNeurologicas ?? "").trim() ||
        (formData.tratamientosTerapeuticos ?? "").trim() ||
        formData.usoAyudasMovilidad ||
        (formData.coberturaMedica ?? "").trim() ||
        (formData.observacionesAdicionalesSalud ?? "").trim() ||
        (formData.familiares?.length ?? 0) > 0 ||
        communicationsAuthorized ||
        currentStep !== 1,
    );

    if (!hasDraftContent) {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      return;
    }

    const payload: PostulacionDraft = {
      formData: JSON.parse(
        JSON.stringify({
          ...formData,
          familiares: formData.familiares ?? [],
        }),
      ) as PostulacionFormData,
      currentStep,
      communicationsAuthorized,
      updatedAt: new Date().toISOString(),
    };

    try {
      window.localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify(payload),
      );
    } catch (error) {
      logPostulacionError(error, "No se pudo guardar el borrador de la postulación.");
    }
  }, [
    communicationsAuthorized,
    currentStep,
    draftReady,
    formData,
    submissionCompleted,
  ]);

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
      typeof value === "string"
        ? field === "dni"
          ? formatDni(value)
          : field === "telefono" || field === "celular"
            ? onlyDigits(value)
            : value
        : value;
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
          logPostulacionError(error);
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

          const personaDto = personaRes.data;
          const info: FamiliarPromptInfo = {
            index,
            dni,
            persona: personaDto,
            familiar:
              (familiarRes?.data as FamiliarRecordDTO | undefined) ?? null,
            requiresCredentials: Boolean(personaDto?.credencialesActivas),
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
            logPostulacionError(error);
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
    options?: { limited?: boolean },
  ) => {
    setFormData((prev) => {
      const familiares = [...(prev.familiares ?? [])];
      if (!familiares[index]) return prev;
      const current = familiares[index];
      const basePersona = current.familiar ?? { ...emptyFamiliarPersona };
      const minimalPersona = {
        ...basePersona,
        personaId: persona.id ?? basePersona.personaId ?? null,
        nombre: persona.nombre ?? basePersona.nombre ?? "",
        apellido: persona.apellido ?? basePersona.apellido ?? "",
        dni: formatDni(persona.dni ?? basePersona.dni ?? ""),
      };

      const fullPersona = options?.limited
        ? minimalPersona
        : {
            ...minimalPersona,
            fechaNacimiento:
              persona.fechaNacimiento ?? basePersona.fechaNacimiento ?? "",
            genero: persona.genero ?? basePersona.genero ?? "",
            estadoCivil: persona.estadoCivil ?? basePersona.estadoCivil ?? "",
            nacionalidad: persona.nacionalidad ?? basePersona.nacionalidad ?? "",
            domicilio: persona.domicilio ?? basePersona.domicilio ?? "",
            telefono: onlyDigits(persona.telefono ?? basePersona.telefono ?? ""),
            celular: onlyDigits(persona.celular ?? basePersona.celular ?? ""),
            email: persona.email ?? basePersona.email ?? "",
            emailContacto: persona.email ?? basePersona.emailContacto ?? "",
            lugarTrabajo:
              familiar?.lugarTrabajo ?? basePersona.lugarTrabajo ?? "",
            ocupacion: familiar?.ocupacion ?? basePersona.ocupacion ?? "",
          };

      const updated = {
        ...current,
        id: familiar?.id ?? current.id,
        familiar: fullPersona,
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
      if (!active.requiresCredentials) {
        applyFamiliarData(active.index, active.persona, active.familiar ?? null, {
          limited: true,
        });
        toast.success(
          "Datos básicos del familiar cargados. Completá el resto manualmente.",
        );
        familiarLookupState.current[active.index] = {
          dni: active.dni,
          status: "completed",
        };
        setExistingFamiliarPrompt(null);
        showNextPrompt();
        return;
      }

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
      telefono: input.telefono ? onlyDigits(input.telefono) : undefined,
      celular: input.celular ? onlyDigits(input.celular) : undefined,
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
    lugarTrabajo?: string,
  ): Promise<number> => {
    const payload: DTO.FamiliarDTO = {
      id: personaId,
      personaId,
      ocupacion,
      lugarTrabajo,
    };

    try {
      const { data } = await identidad.familiares.byId(personaId);
      await identidad.familiares.update(personaId, payload);
      return data?.id ?? personaId;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        const { data } = await identidad.familiares.create({
          personaId,
          ocupacion,
          lugarTrabajo,
        });
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

  const verifyDniAvailability = useCallback(async (dni: string): Promise<string> => {
    const normalized = formatDni(dni);
    if (!normalized) {
      const invalid = new Error("invalid-dni");
      invalid.name = "InvalidDniError";
      throw invalid;
    }

    try {
      const throwDuplicate = () => {
        const duplicate = new Error("duplicate-solicitud");
        duplicate.name = "DuplicateSolicitudError";
        throw duplicate;
      };

      const personaRes = await identidad.personasCore.findIdByDni(normalized);
      const personaIdRaw = personaRes?.data;
      if (!personaIdRaw) {
        return normalized;
      }

      throwDuplicate();
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return normalized;
      }
      throw error;
    }
  }, []);

  const addFamiliar = (dni: string) => {
    setFormData((prev) => {
      const familiarEntry = createEmptyFamiliar();
      familiarEntry.familiar.dni = dni;
      familiarEntry.dniLocked = true;

      return {
        ...prev,
        familiares: [...(prev.familiares ?? []), familiarEntry],
      };
    });
    setErrors((prev) => {
      if (!prev.familiares) return prev;
      const next = { ...prev };
      delete next.familiares;
      return next;
    });

    return true;
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
    const dniRegistrado = dniDuplicate;
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
    if (dniRegistrado) {
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
        dniRegistrado
          ? DNI_DUPLICADO_ERROR
          : null,
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
      if (!fechaNacimiento) {
        newErrors[`familiares.${index}.familiar.fechaNacimiento`] = true;
        ok = false;
      } else if (!isBirthDateValid(fechaNacimiento)) {
        newErrors[`familiares.${index}.familiar.fechaNacimiento`] = true;
        ok = false;
        invalidBirthDate = true;
      }
      const email = familiarPersona?.emailContacto?.trim();
      if (!email) {
        newErrors[`familiares.${index}.familiar.emailContacto`] = true;
        ok = false;
      }
      const telefono = familiarPersona?.telefono?.trim();
      if (!telefono) {
        newErrors[`familiares.${index}.familiar.telefono`] = true;
        ok = false;
      }
      const celular = familiarPersona?.celular?.trim();
      if (!celular) {
        newErrors[`familiares.${index}.familiar.celular`] = true;
        ok = false;
      }
      const ocupacion = familiarPersona?.ocupacion?.trim();
      if (!ocupacion) {
        newErrors[`familiares.${index}.familiar.ocupacion`] = true;
        ok = false;
      }
      const lugarTrabajo = familiarPersona?.lugarTrabajo?.trim();
      if (!lugarTrabajo) {
        newErrors[`familiares.${index}.familiar.lugarTrabajo`] = true;
        ok = false;
      }
      const domicilio = familiarPersona?.domicilio?.trim();
      if (!domicilio) {
        newErrors[`familiares.${index}.familiar.domicilio`] = true;
        ok = false;
      }
    });

    setErrors(newErrors);
    if (!ok) {
      const description = [
        "Completá todos los datos del familiar (relación, identificación y contacto).",
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
          familiarPersona.lugarTrabajo || undefined,
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

      clearDraft();
      setSubmissionCompleted(true);
      setFormData({ ...initialFormData, familiares: [] });
      setAspirantePersonaPreview(null);
      setLastLookupDni("");
      setCommunicationsAuthorized(false);
      setErrors({});
      setCurrentStep(1);
    } catch (err: any) {
      logPostulacionError(err);
      toast.error(`Error al enviar: ${err?.message ?? "No se pudo enviar"}`);
    }
  };

  if (submissionCompleted) {
    return (
      <div className="min-h-screen bg-background dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 p-4 transition-colors">
        <div className="max-w-2xl mx-auto space-y-6">
          <BackButton href="/" className="ml-0" />
          <Card className="text-center">
            <CardHeader className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-semibold">
                {completionMessages.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>{completionMessages.body}</p>
              <p>{completionMessages.reminder}</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Button asChild>
                  <Link href="/">Ir al inicio</Link>
                </Button>
                <Button variant="outline" onClick={handleStartNewSubmission}>
                  Enviar una nueva postulación
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleDniGateSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const sanitized = formatDni(dniGateValue ?? "");
    if (!sanitized || sanitized.length < 7 || sanitized.length > 10) {
      showDniGateError("Ingresá un DNI válido de 7 a 10 dígitos.");
      return;
    }

    setDniGateLoading(true);
    setDniGateError(null);
    setDniDuplicate(false);

    try {
      const verifiedDni = await verifyDniAvailability(sanitized);
      setDniGateValue(verifiedDni);
      handleInputChange("dni", verifiedDni);
      setDniGateCompleted(true);
      setDniGateOpen(false);
    } catch (error: any) {
      if (
        error?.name === "DuplicateSolicitudError" ||
        error?.message === "duplicate-solicitud"
      ) {
        setDniDuplicate(true);
        showDniGateError(DNI_DUPLICADO_ERROR);
        return;
      }
      if (error?.name === "InvalidDniError" || error?.message === "invalid-dni") {
        showDniGateError("Ingresá un DNI válido de 7 a 10 dígitos.");
        return;
      }
      logPostulacionError(error, "No se pudo verificar el DNI del aspirante");
      showDniGateError("No se pudo verificar el DNI. Intentá nuevamente.");
    } finally {
      setDniGateLoading(false);
    }
  };

  const handleRequestDniChange = () => {
    clearDraft();
    resetFormState();
    restartDraftTracking();
    toast.info("Ingresá el nuevo DNI para iniciar otra solicitud.");
  };

  function handleStartNewSubmission() {
    clearDraft();
    resetFormState();
    restartDraftTracking();
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
            dniDuplicado={dniDuplicate}
            dniLookupLoading={dniLookupLoading}
            dniBloqueado={dniGateCompleted}
            onRequestDniChange={handleRequestDniChange}
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

  const handleRestoreDraft = () => {
    if (!pendingDraft) return;
    const normalizedStep = Math.min(
      Math.max(Number(pendingDraft.currentStep) || 1, 1),
      totalSteps,
    );
    setFormData({
      ...initialFormData,
      ...(pendingDraft.formData ?? {}),
      familiares: pendingDraft.formData?.familiares ?? [],
    });
    setCurrentStep(normalizedStep);
    setCommunicationsAuthorized(Boolean(pendingDraft.communicationsAuthorized));
    setDraftPromptVisible(false);
    setPendingDraft(null);
    setDraftReady(true);
    const draftDni = formatDni(pendingDraft.formData?.dni ?? "");
    if (draftDni) {
      setDniGateValue(draftDni);
      setDniGateCompleted(true);
      setDniGateOpen(false);
      setDniDuplicate(false);
      setDniGateError(null);
    } else {
      setDniGateValue("");
      setDniGateCompleted(false);
      setDniGateOpen(true);
    }
    toast.success("Borrador recuperado correctamente.");
  };

  const handleDiscardDraft = () => {
    clearDraft();
    resetFormState();
    restartDraftTracking();
    toast.info("Se descartó el borrador almacenado.");
  };

  const handleCancel = () => {
    const confirmed =
      typeof window === "undefined" ||
      window.confirm(
        "¿Querés cancelar la postulación y descartar el borrador guardado?",
      );
    if (!confirmed) return;

    clearDraft();
    resetFormState();
    toast.info("Se canceló la postulación. Podés comenzar una nueva cuando quieras.");
    restartDraftTracking();
  };

  return (
    <div
      className="min-h-screen bg-background dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 p-4 transition-colors"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <BackButton href="/" className="ml-0" />
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Postulación de Alumno
          </h1>
          <p className="text-muted-foreground">
            Escuela Complejo Evangélico Pilar
          </p>
        </div>

        {draftPromptVisible && pendingDraft ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Continuá donde lo dejaste</AlertTitle>
            <AlertDescription className="mt-2 space-y-3">
              <p>
                Encontramos un borrador guardado de tu postulación anterior.
                Podés recuperarlo para seguir completando o descartarlo y
                comenzar nuevamente.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button onClick={handleRestoreDraft}>Recuperar borrador</Button>
                <Button variant="outline" onClick={handleDiscardDraft}>
                  Descartar
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : null}

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>
              Paso {currentStep} de {totalSteps}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStep()}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="ghost" onClick={handleCancel}>
                  Cancelar postulación
                </Button>
                {currentStep > 1 ? (
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </Button>
                ) : null}
              </div>

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

      <Dialog
        open={dniGateOpen}
        onOpenChange={(open) => {
          if (!open && !dniGateCompleted) return;
          setDniGateOpen(open);
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          hideCloseButton
          onInteractOutside={(event) => {
            if (!dniGateCompleted) event.preventDefault();
          }}
          onEscapeKeyDown={(event) => {
            if (!dniGateCompleted) event.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Verificá el DNI del aspirante</DialogTitle>
            <DialogDescription>
              Ingresá el documento para asegurarnos de que no exista otra solicitud registrada.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDniGateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dni-gate">DNI del aspirante</Label>
              <Input
                id="dni-gate"
                autoFocus
                inputMode="numeric"
                pattern="\d*"
                minLength={7}
                maxLength={10}
                value={dniGateValue}
                onChange={(event) => {
                  const value = formatDni(event.target.value);
                  setDniGateValue(value);
                  setDniGateError(null);
                  setDniDuplicate(false);
                }}
              />
              <p className="text-sm text-muted-foreground">
                Ingresá el DNI sin puntos para continuar con la solicitud.
              </p>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={dniGateLoading} className="min-w-[160px]">
                {dniGateLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continuar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ExistingFamiliarDialog
        open={!!existingFamiliarPrompt}
        persona={existingFamiliarPrompt?.persona}
        dni={existingFamiliarPrompt?.dni}
        loading={familiarAuthLoading}
        error={familiarAuthError}
        requiresCredentials={
          existingFamiliarPrompt?.requiresCredentials ?? false
        }
        onConfirm={handleExistingFamiliarConfirm}
        onCancel={handleExistingFamiliarCancel}
      />
    </div>
  );
}
