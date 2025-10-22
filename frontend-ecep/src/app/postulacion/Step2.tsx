// components/Step2.tsx
"use client";

import React, { useState } from "react";
import { AlertCircle, Loader2, Plus, Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { formatDni, maxBirthDate, onlyDigits } from "@/lib/form-utils";
import { RolVinculo } from "@/types/api-generated";
import type { FamiliarForm, PostulacionFormData } from "./types";

interface Step2Props {
  formData: PostulacionFormData;
  handleInputChange: (
    field: string,
    value: any,
    options?: { errorKeys?: string | string[] },
  ) => void;
  addFamiliar: (dni: string) => boolean | Promise<boolean>;
  errors?: Record<string, boolean>;
}

export function Step2({
  formData,
  handleInputChange,
  addFamiliar,
  errors = {},
}: Step2Props) {
  const familiares = formData.familiares ?? [];
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [dniValue, setDniValue] = useState("");
  const [dniError, setDniError] = useState<string | null>(null);
  const [dialogSubmitting, setDialogSubmitting] = useState(false);

  const updateFamiliares = (
    index: number,
    producer: (current: FamiliarForm) => FamiliarForm,
    errorKeys?: string | string[],
  ) => {
    const next = familiares.map((entry, position) =>
      position === index ? producer(entry) : entry,
    );
    handleInputChange("familiares", next, { errorKeys });
  };

  const updateFamiliarPersona = (
    index: number,
    patch: Partial<FamiliarForm["familiar"]>,
    errorKeys?: string | string[],
  ) =>
    updateFamiliares(
      index,
      (entry) => ({
        ...entry,
        familiar: {
          ...entry.familiar,
          ...patch,
        },
      }),
      errorKeys,
    );
  const relationshipOptions: { value: RolVinculo; label: string }[] = [
    { value: RolVinculo.PADRE, label: "Padre" },
    { value: RolVinculo.MADRE, label: "Madre" },
    { value: RolVinculo.TUTOR, label: "Tutor/a" },
    { value: RolVinculo.OTRO, label: "Otro/a" },
  ];

  const hasError = (key: string) => Boolean(errors?.[key]);

  const openAddDialog = () => {
    setDniValue("");
    setDniError(null);
    setAddDialogOpen(true);
  };

  const closeAddDialog = () => {
    if (dialogSubmitting) return;
    setAddDialogOpen(false);
    setDniError(null);
  };

  const handleDialogSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (dialogSubmitting) return;

    const normalizedDni = formatDni(dniValue);
    if (!normalizedDni || normalizedDni.length < 7) {
      setDniError("Ingresá un DNI válido de 7 a 10 dígitos.");
      return;
    }

    const dniExists = familiares.some((entry) => {
      const current = formatDni(entry.familiar?.dni ?? "");
      return current === normalizedDni;
    });

    if (dniExists) {
      setDniError("Ya agregaste un familiar con este DNI.");
      return;
    }

    setDialogSubmitting(true);
    try {
      const success = await Promise.resolve(addFamiliar(normalizedDni));
      if (success) {
        setAddDialogOpen(false);
        setDniValue("");
        setDniError(null);
      } else {
        setDniError("Ya agregaste un familiar con este DNI.");
      }
    } catch (error) {
      setDniError("No se pudo agregar el familiar. Intentá nuevamente.");
    } finally {
      setDialogSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ——— Título + Botón ——— */}
      <div className="flex items-center mb-6">
        <Users className="h-6 w-6 text-primary mr-2" />
        <h3 className="text-lg font-medium">Datos Familiares</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={openAddDialog}
          className="ml-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Familiar
        </Button>
      </div>

      <Dialog
        open={addDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeAddDialog();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar familiar</DialogTitle>
            <DialogDescription>
              Ingresá el DNI del familiar que querés añadir a la solicitud.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDialogSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nuevo-familiar-dni">DNI</Label>
              <Input
                id="nuevo-familiar-dni"
                value={dniValue}
                onChange={(event) => {
                  setDniValue(formatDni(event.target.value));
                  if (dniError) {
                    setDniError(null);
                  }
                }}
                inputMode="numeric"
                autoComplete="off"
                placeholder="12345678"
                aria-invalid={dniError ? true : undefined}
                required
                autoFocus
                disabled={dialogSubmitting}
              />
              {dniError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{dniError}</AlertDescription>
                </Alert>
              ) : null}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeAddDialog}
                disabled={dialogSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={dialogSubmitting}>
                {dialogSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Agregando
                  </>
                ) : (
                  "Continuar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ——— Feedback si no hay ninguno ——— */}
      {familiares.length === 0 && (
        <p className="text-sm text-gray-500">
          No hay familiares agregados. Haz clic en “Agregar Familiar” para
          añadir uno.
        </p>
      )}

      {errors.familiares && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Agregá al menos un familiar con sus datos completos.
          </AlertDescription>
        </Alert>
      )}

      {/* ——— Lista de Formularios de cada Familiar ——— */}
      <div className="space-y-6">
        {familiares.map((f, i) => {
          const entryKey = `familiares.${i}`;
          const familiarKey = `${entryKey}.familiar`;
          const tipoRelacionError = hasError(`${entryKey}.tipoRelacion`);
          const nombreError = hasError(`${familiarKey}.nombre`);
          const apellidoError = hasError(`${familiarKey}.apellido`);
          const dniError = hasError(`${familiarKey}.dni`);
          const fechaNacimientoError = hasError(`${familiarKey}.fechaNacimiento`);
          const emailError = hasError(`${familiarKey}.emailContacto`);
          const telefonoError = hasError(`${familiarKey}.telefono`);
          const celularError = hasError(`${familiarKey}.celular`);
          const ocupacionError = hasError(`${familiarKey}.ocupacion`);
          const lugarTrabajoError = hasError(`${familiarKey}.lugarTrabajo`);
          const domicilioError = hasError(`${familiarKey}.domicilio`);

          return (
            <div key={i} className="border rounded-lg p-4">
              <h4 className="font-medium mb-4">Familiar {i + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Relación */}
                <div>
                  <Label htmlFor={`tipoRelacion-${i}`}>Relación</Label>
                  <Select
                    id={`tipoRelacion-${i}`}
                    value={f.tipoRelacion}
                    onValueChange={(value) =>
                      updateFamiliares(
                        i,
                        (entry) => ({
                          ...entry,
                          tipoRelacion: value as FamiliarForm["tipoRelacion"],
                        }),
                        `familiares.${i}.tipoRelacion`,
                      )
                    }
                  >
                    <SelectTrigger
                      aria-invalid={tipoRelacionError || undefined}
                      className={cn(tipoRelacionError && "border-destructive")}
                      aria-required={true}
                    >
                      <SelectValue placeholder="Seleccione relación" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationshipOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Nombre */}
                <div>
                  <Label htmlFor={`familiar-nombre-${i}`}>Nombre</Label>
                  <Input
                    id={`familiar-nombre-${i}`}
                    value={f.familiar?.nombre ?? ""}
                    onChange={(event) =>
                      updateFamiliarPersona(
                        i,
                        { nombre: event.target.value },
                        `familiares.${i}.familiar.nombre`,
                      )
                    }
                    placeholder="Nombre"
                    aria-invalid={nombreError || undefined}
                    className={cn(nombreError && "border-destructive")}
                    required
                  />
                </div>

                {/* Apellido */}
                <div>
                  <Label htmlFor={`familiar-apellido-${i}`}>Apellido</Label>
                  <Input
                    id={`familiar-apellido-${i}`}
                    value={f.familiar?.apellido ?? ""}
                    onChange={(event) =>
                      updateFamiliarPersona(
                        i,
                        { apellido: event.target.value },
                        `familiares.${i}.familiar.apellido`,
                      )
                    }
                    placeholder="Apellido"
                    aria-invalid={apellidoError || undefined}
                    className={cn(apellidoError && "border-destructive")}
                    required
                  />
                </div>

                {/* DNI */}
                <div>
                  <Label htmlFor={`familiar-dni-${i}`}>DNI</Label>
                  <Input
                    id={`familiar-dni-${i}`}
                    inputMode="numeric"
                    pattern="\d*"
                    minLength={7}
                    maxLength={10}
                    value={f.familiar?.dni ?? ""}
                    onChange={(event) =>
                      updateFamiliarPersona(
                        i,
                        { dni: formatDni(event.target.value) },
                        `familiares.${i}.familiar.dni`,
                      )
                    }
                    placeholder="12345678"
                    aria-invalid={dniError || undefined}
                    className={cn(dniError && "border-destructive")}
                    required
                  />
                </div>

                {/* Fecha de Nacimiento */}
                <div>
                  <Label htmlFor={`familiar-fecha-${i}`}>
                    Fecha de Nacimiento
                  </Label>
                  <DatePicker
                    id={`familiar-fecha-${i}`}
                    max={maxBirthDate}
                    value={f.familiar?.fechaNacimiento ?? undefined}
                    onChange={(value) =>
                      updateFamiliarPersona(
                        i,
                        { fechaNacimiento: value ?? "" },
                        `familiares.${i}.familiar.fechaNacimiento`,
                      )
                    }
                    error={Boolean(fechaNacimientoError)}
                    required
                    showMonthDropdown
                    showYearDropdown
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor={`familiar-email-${i}`}>Email</Label>
                  <Input
                    id={`familiar-email-${i}`}
                    type="email"
                    value={f.familiar?.emailContacto ?? ""}
                    onChange={(event) =>
                      updateFamiliarPersona(
                        i,
                        { emailContacto: event.target.value },
                        `familiares.${i}.familiar.emailContacto`,
                      )
                    }
                    placeholder="email@dominio.com"
                    aria-invalid={emailError || undefined}
                    className={cn(emailError && "border-destructive")}
                    required
                  />
                </div>

              {/* Teléfono */}
              <div>
                <Label htmlFor={`familiar-telefono-${i}`}>Teléfono</Label>
                <Input
                  id={`familiar-telefono-${i}`}
                  type="tel"
                  inputMode="numeric"
                  pattern="\\d*"
                  value={f.familiar?.telefono ?? ""}
                  onChange={(event) => {
                    const telefono = onlyDigits(event.target.value);
                    updateFamiliarPersona(
                      i,
                      { telefono },
                      `familiares.${i}.familiar.telefono`,
                    );
                  }}
                  placeholder="11-1234-5678"
                  aria-invalid={telefonoError || undefined}
                  className={cn(telefonoError && "border-destructive")}
                  required
                />
              </div>

              {/* Celular */}
              <div>
                <Label htmlFor={`familiar-celular-${i}`}>Celular</Label>
                <Input
                  id={`familiar-celular-${i}`}
                  type="tel"
                  inputMode="numeric"
                  pattern="\\d*"
                  value={f.familiar?.celular ?? ""}
                  onChange={(event) => {
                    const celular = onlyDigits(event.target.value);
                    updateFamiliarPersona(
                      i,
                      { celular },
                      `familiares.${i}.familiar.celular`,
                    );
                  }}
                  placeholder="11-1234-5678"
                  aria-invalid={celularError || undefined}
                  className={cn(celularError && "border-destructive")}
                  required
                />
              </div>

              {/* Ocupación */}
              <div className="md:col-span-2">
                <Label htmlFor={`familiar-ocupacion-${i}`}>Ocupación</Label>
                <Input
                  id={`familiar-ocupacion-${i}`}
                  value={f.familiar?.ocupacion ?? ""}
                  onChange={(event) =>
                    updateFamiliarPersona(
                      i,
                      { ocupacion: event.target.value },
                      `familiares.${i}.familiar.ocupacion`,
                    )
                  }
                  placeholder="Profesión u ocupación"
                  aria-invalid={ocupacionError || undefined}
                  className={cn(ocupacionError && "border-destructive")}
                  required
                />
              </div>

              {/* Lugar de trabajo */}
              <div className="md:col-span-2">
                <Label htmlFor={`familiar-lugar-trabajo-${i}`}>
                  Lugar de trabajo
                </Label>
                <Input
                  id={`familiar-lugar-trabajo-${i}`}
                  value={f.familiar?.lugarTrabajo ?? ""}
                  onChange={(event) =>
                    updateFamiliarPersona(
                      i,
                      { lugarTrabajo: event.target.value },
                      `familiares.${i}.familiar.lugarTrabajo`,
                    )
                  }
                  placeholder="Empresa o institución"
                  aria-invalid={lugarTrabajoError || undefined}
                  className={cn(lugarTrabajoError && "border-destructive")}
                  required
                />
              </div>

              {/* Domicilio */}
              <div>
                <Label htmlFor={`familiar-domicilio-${i}`}>Domicilio</Label>
                <Input
                  id={`familiar-domicilio-${i}`}
                  value={f.familiar?.domicilio ?? ""}
                  onChange={(event) =>
                    updateFamiliarPersona(
                      i,
                      { domicilio: event.target.value },
                      `familiares.${i}.familiar.domicilio`,
                    )
                  }
                  placeholder="Dirección completa"
                  aria-invalid={domicilioError || undefined}
                  className={cn(domicilioError && "border-destructive")}
                  required
                />
              </div>

              {/* Vive con el alumno */}
              <div className="md:col-span-2 flex items-center space-x-2">
                <Checkbox
                  id={`viveConAlumno-${i}`}
                  checked={f.viveConAlumno ?? false}
                  onCheckedChange={(checked) =>
                    updateFamiliares(
                      i,
                      (entry) => ({
                        ...entry,
                        viveConAlumno: checked === true,
                      }),
                    )
                  }
                />
                <Label htmlFor={`viveConAlumno-${i}`}>Vive con el alumno</Label>
              </div>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
