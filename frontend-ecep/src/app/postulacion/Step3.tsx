// components/Step3.tsx
"use client";

import React from "react";
import { Home } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { PostulacionFormData } from "./types";

enum InternetConnectivity {
  SATELITAL = "Satelital",
  WIFI = "Wifi",
  DATOS_MOVILES = "Datos Moviles",
  SIN_CONEXION = "Sin Conexión",
}

interface Step3Props {
  formData: PostulacionFormData;
  handleInputChange: (
    field: string,
    value: any,
    options?: { errorKeys?: string | string[] },
  ) => void;
  errors?: Record<string, boolean>;
}

export function Step3({ formData, handleInputChange, errors = {} }: Step3Props) {
  const hasError = (key: string) => Boolean(errors?.[key]);

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-6">
        <Home className="h-6 w-6 text-primary mr-2" />
        <h3 className="text-lg font-medium">Condiciones del Hogar</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="conectividadInternet">
            Tipo de Conectividad a Internet
          </Label>
          <Select
            value={formData.conectividadInternet}
            onValueChange={(v) => handleInputChange("conectividadInternet", v)}
            required
          >
            <SelectTrigger
              aria-invalid={hasError("conectividadInternet") || undefined}
              className={cn(
                errors.conectividadInternet && "border-destructive",
              )}
            >
              <SelectValue placeholder="Seleccione conexión" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(InternetConnectivity).map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="dispositivosDisponibles">
            Dispositivos Disponibles para Escolaridad
          </Label>
          <Textarea
            id="dispositivosDisponibles"
            value={formData.dispositivosDisponibles ?? ""}
            onChange={(e) =>
              handleInputChange("dispositivosDisponibles", e.target.value)
            }
            placeholder="Ej: PC, tablet, smartphone..."
            rows={3}
            required
            aria-invalid={
              hasError("dispositivosDisponibles") || undefined
            }
            className={cn(
              errors.dispositivosDisponibles && "border-destructive",
            )}
          />
        </div>

        <div>
          <Label htmlFor="idiomasHabladosHogar">
            Idiomas Hablados en el Hogar
          </Label>
          <Input
            id="idiomasHabladosHogar"
            value={formData.idiomasHabladosHogar ?? ""}
            onChange={(e) =>
              handleInputChange("idiomasHabladosHogar", e.target.value)
            }
            placeholder="Ej: Español, Inglés..."
            required
            aria-invalid={hasError("idiomasHabladosHogar") || undefined}
            className={cn(
              errors.idiomasHabladosHogar && "border-destructive",
            )}
          />
        </div>
      </div>
    </div>
  );
}
