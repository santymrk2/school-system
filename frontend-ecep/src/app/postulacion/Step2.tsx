// components/Step2.tsx
"use client";

import React from "react";
import { Users, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";
import { formatDni } from "@/lib/form-utils";
import { RolVinculo } from "@/types/api-generated";
import type { PostulacionFormData } from "./types";

interface Step2Props {
  formData: PostulacionFormData;
  handleInputChange: (
    field: string,
    value: any,
    options?: { errorKeys?: string | string[] },
  ) => void;
  addFamiliar: () => void;
  errors?: Record<string, boolean>;
}

export function Step2({
  formData,
  handleInputChange,
  addFamiliar,
  errors = {},
}: Step2Props) {
  const familiares = formData.familiares ?? [];
  const relationshipOptions: { value: RolVinculo; label: string }[] = [
    { value: RolVinculo.PADRE, label: "Padre" },
    { value: RolVinculo.MADRE, label: "Madre" },
    { value: RolVinculo.TUTOR, label: "Tutor/a" },
    { value: RolVinculo.OTRO, label: "Otro/a" },
  ];

  return (
    <div className="space-y-4">
      {/* ——— Título + Botón ——— */}
      <div className="flex items-center mb-6">
        <Users className="h-6 w-6 text-primary mr-2" />
        <h3 className="text-lg font-medium">Datos Familiares</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={addFamiliar}
          className="ml-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Familiar
        </Button>
      </div>

      {/* ——— Feedback si no hay ninguno ——— */}
      {familiares.length === 0 && (
        <p className="text-sm text-gray-500">
          No hay familiares agregados. Haz clic en “Agregar Familiar” para
          añadir uno.
        </p>
      )}

      {errors.familiares && (
        <p className="text-sm text-destructive">
          Agregá al menos un familiar con sus datos completos.
        </p>
      )}

      {/* ——— Lista de Formularios de cada Familiar ——— */}
      <div className="space-y-6">
        {familiares.map((f, i) => (
          <div key={i} className="border rounded-lg p-4">
            <h4 className="font-medium mb-4">Familiar {i + 1}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Relación */}
              <div>
                <Label htmlFor={`tipoRelacion-${i}`}>Relación</Label>
                <Select
                  id={`tipoRelacion-${i}`}
                  value={f.tipoRelacion}
                  onValueChange={(v) =>
                    handleInputChange(
                      "familiares",
                      familiares.map((x, j) =>
                        j === i ? { ...x, tipoRelacion: v as string } : x,
                      ),
                      { errorKeys: [`familiares.${i}.tipoRelacion`] },
                    )
                  }
                  className={cn(
                    errors[`familiares.${i}.tipoRelacion`] &&
                      "border-destructive",
                  )}
                >
                  <SelectTrigger>
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
                  onChange={(e) =>
                    handleInputChange(
                      "familiares",
                      familiares.map((x, j) =>
                        j === i
                          ? {
                              ...x,
                              familiar: {
                                ...x.familiar!,
                                nombre: e.target.value,
                              },
                            }
                          : x,
                      ),
                      { errorKeys: [`familiares.${i}.familiar.nombre`] },
                    )
                  }
                  placeholder="Nombre"
                  className={cn(
                    errors[`familiares.${i}.familiar.nombre`] &&
                      "border-destructive",
                  )}
                />
              </div>

              {/* Apellido */}
              <div>
                <Label htmlFor={`familiar-apellido-${i}`}>Apellido</Label>
                <Input
                  id={`familiar-apellido-${i}`}
                  value={f.familiar?.apellido ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "familiares",
                      familiares.map((x, j) =>
                        j === i
                          ? {
                              ...x,
                              familiar: {
                                ...x.familiar!,
                                apellido: e.target.value,
                              },
                            }
                          : x,
                      ),
                      { errorKeys: [`familiares.${i}.familiar.apellido`] },
                    )
                  }
                  placeholder="Apellido"
                  className={cn(
                    errors[`familiares.${i}.familiar.apellido`] &&
                      "border-destructive",
                  )}
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
                  onChange={(e) =>
                    handleInputChange(
                      "familiares",
                      familiares.map((x, j) =>
                        j === i
                          ? {
                              ...x,
                              familiar: {
                                ...x.familiar!,
                                dni: formatDni(e.target.value),
                              },
                            }
                          : x,
                      ),
                      { errorKeys: [`familiares.${i}.familiar.dni`] },
                    )
                  }
                  placeholder="12345678"
                  className={cn(
                    errors[`familiares.${i}.familiar.dni`] &&
                      "border-destructive",
                  )}
                />
              </div>

              {/* Fecha de Nacimiento */}
              <div>
                <Label htmlFor={`familiar-fecha-${i}`}>
                  Fecha de Nacimiento
                </Label>
                <Input
                  id={`familiar-fecha-${i}`}
                  type="date"
                  value={f.familiar?.fechaNacimiento ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "familiares",
                      familiares.map((x, j) =>
                        j === i
                          ? {
                              ...x,
                              familiar: {
                                ...x.familiar!,
                                fechaNacimiento: e.target.value,
                              },
                            }
                          : x,
                      ),
                      { errorKeys: [`familiares.${i}.familiar.fechaNacimiento`] },
                    )
                  }
                  className={cn(
                    errors[`familiares.${i}.familiar.fechaNacimiento`] &&
                      "border-destructive",
                  )}
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor={`familiar-email-${i}`}>Email</Label>
                <Input
                  id={`familiar-email-${i}`}
                  type="email"
                  value={f.familiar?.emailContacto ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "familiares",
                      familiares.map((x, j) =>
                        j === i
                          ? {
                              ...x,
                              familiar: {
                                ...x.familiar!,
                                emailContacto: e.target.value,
                              },
                            }
                          : x,
                      ),
                      { errorKeys: [`familiares.${i}.familiar.emailContacto`] },
                    )
                  }
                  placeholder="email@dominio.com"
                  className={cn(
                    errors[`familiares.${i}.familiar.emailContacto`] &&
                      "border-destructive",
                  )}
                />
              </div>

              {/* Teléfono */}
              <div>
                <Label htmlFor={`familiar-telefono-${i}`}>Teléfono</Label>
                <Input
                  id={`familiar-telefono-${i}`}
                  value={f.familiar?.telefono ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "familiares",
                      familiares.map((x, j) =>
                        j === i
                          ? {
                              ...x,
                              familiar: {
                                ...x.familiar!,
                                telefono: e.target.value,
                              },
                            }
                          : x,
                      ),
                    )
                  }
                  placeholder="11-1234-5678"
                />
              </div>

              {/* Celular */}
              <div>
                <Label htmlFor={`familiar-celular-${i}`}>Celular</Label>
                <Input
                  id={`familiar-celular-${i}`}
                  value={f.familiar?.celular ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "familiares",
                      familiares.map((x, j) =>
                        j === i
                          ? {
                              ...x,
                              familiar: {
                                ...x.familiar!,
                                celular: e.target.value,
                              },
                            }
                          : x,
                      ),
                    )
                  }
                  placeholder="11-1234-5678"
                />
              </div>

              {/* Domicilio */}
              <div>
                <Label htmlFor={`familiar-domicilio-${i}`}>Domicilio</Label>
                <Input
                  id={`familiar-domicilio-${i}`}
                  value={f.familiar?.domicilio ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "familiares",
                      familiares.map((x, j) =>
                        j === i
                          ? {
                              ...x,
                              familiar: {
                                ...x.familiar!,
                                domicilio: e.target.value,
                              },
                            }
                          : x,
                      ),
                    )
                  }
                  placeholder="Dirección completa"
                />
              </div>

              {/* Vive con el alumno */}
              <div className="md:col-span-2 flex items-center space-x-2">
                <Checkbox
                  id={`viveConAlumno-${i}`}
                  checked={f.viveConAlumno ?? false}
                  onCheckedChange={(c) =>
                    handleInputChange(
                      "familiares",
                      familiares.map((x, j) =>
                        j === i ? { ...x, viveConAlumno: c as boolean } : x,
                      ),
                    )
                  }
                />
                <Label htmlFor={`viveConAlumno-${i}`}>Vive con el alumno</Label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
