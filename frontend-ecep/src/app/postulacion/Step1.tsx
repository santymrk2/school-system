// app/postulacion/Step1.tsx
"use client";
import React from "react";
import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Curso, Turno } from "@/types/api-generated";
import type { PostulacionFormData } from "./types";
import { cn } from "@/lib/utils";

import { formatDni } from "@/lib/form-utils";

import { maxBirthDate } from "@/lib/form-utils";


interface Props {
  formData: PostulacionFormData;
  handleInputChange: (
    field: string,
    value: any,
    options?: { errorKeys?: string | string[] },
  ) => void;
  errors: Record<string, boolean>;
  personaDetectadaId?: number | null;
  dniLookupLoading?: boolean;
}

export function Step1({
  formData,
  handleInputChange,
  errors,
  personaDetectadaId,
  dniLookupLoading,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Título del paso */}
      <div className="flex items-center mb-6">
        <User className="h-6 w-6 text-primary mr-2" />
        <h3 className="text-lg font-medium">Datos del Aspirante</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre */}
        <div>
          <Label htmlFor="nombre">Nombre</Label>
          <Input
            id="nombre"
            value={formData.nombre || ""}
            onChange={(e) => handleInputChange("nombre", e.target.value)}
            placeholder="Ingrese el nombre"
            aria-invalid={errors.nombre || undefined}
            className={cn(errors.nombre && "border-destructive")}
          />
        </div>

        {/* Apellido */}
        <div>
          <Label htmlFor="apellido">Apellido</Label>
          <Input
            id="apellido"
            value={formData.apellido || ""}
            onChange={(e) => handleInputChange("apellido", e.target.value)}
            placeholder="Ingrese el apellido"
            aria-invalid={errors.apellido || undefined}
            className={cn(errors.apellido && "border-destructive")}
          />
        </div>

        {/* DNI */}
        <div>
          <Label htmlFor="dni">DNI</Label>
          <Input
            id="dni"
            type="text"
            inputMode="numeric"
            pattern="\d*"
            minLength={7}
            maxLength={10}
            value={formData.dni || ""}
            onChange={(e) => handleInputChange("dni", formatDni(e.target.value))}
            placeholder="12345678"
            aria-invalid={errors.dni || undefined}
            className={cn(errors.dni && "border-destructive")}
          />
          <div className="mt-1 text-xs text-muted-foreground min-h-[16px]">
            {dniLookupLoading
              ? "Verificando DNI…"
              : personaDetectadaId
                ? `Persona existente detectada (ID #${personaDetectadaId}).`
                : ""}
          </div>
        </div>

        {/* Fecha de Nacimiento */}
        <div>
          <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
          <Input
            id="fechaNacimiento"
            type="date"
            max={maxBirthDate}
            value={formData.fechaNacimiento || ""}
            onChange={(e) =>
              handleInputChange("fechaNacimiento", e.target.value)
            }
            aria-invalid={errors.fechaNacimiento || undefined}
            className={cn(errors.fechaNacimiento && "border-destructive")}
          />
        </div>

        {/* Curso Solicitado */}
        <div>
          <Label htmlFor="cursoSolicitado">Curso Solicitado</Label>
          <Select
            value={formData.cursoSolicitado}
            onValueChange={(v) => handleInputChange("cursoSolicitado", v)}
          >
            <SelectTrigger
              aria-invalid={errors.cursoSolicitado || undefined}
              className={cn(errors.cursoSolicitado && "border-destructive")}
            >
              <SelectValue placeholder="Seleccione un curso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Curso.SALA_4.toString()}>
                Sala de 4 años
              </SelectItem>
              <SelectItem value={Curso.SALA_5.toString()}>
                Sala de 5 años
              </SelectItem>
              <SelectItem value={Curso.PRIMERO.toString()}>1° Grado</SelectItem>
              <SelectItem value={Curso.SEGUNDO.toString()}>2° Grado</SelectItem>
              <SelectItem value={Curso.TERCERO.toString()}>3° Grado</SelectItem>
              <SelectItem value={Curso.CUARTO.toString()}>4° Grado</SelectItem>
              <SelectItem value={Curso.QUINTO.toString()}>5° Grado</SelectItem>
              <SelectItem value={Curso.SEXTO.toString()}>6° Grado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Turno Preferido */}
        <div>
          <Label htmlFor="turnoPreferido">Turno Preferido</Label>
          <Select
            value={formData.turnoPreferido}
            onValueChange={(v) => handleInputChange("turnoPreferido", v)}
          >
            <SelectTrigger
              aria-invalid={errors.turnoPreferido || undefined}
              className={cn(errors.turnoPreferido && "border-destructive")}
            >
              <SelectValue placeholder="Seleccione un turno" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Turno.MANANA.toString()}>Mañana</SelectItem>
              <SelectItem value={Turno.TARDE.toString()}>Tarde</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Escuela Actual */}
        <div>
          <Label htmlFor="escuelaActual">Escuela Actual</Label>
          <Input
            id="escuelaActual"
            value={formData.escuelaActual || ""}
            onChange={(e) => handleInputChange("escuelaActual", e.target.value)}
            aria-invalid={errors.escuelaActual || undefined}
            className={cn(errors.escuelaActual && "border-destructive")}
          />
        </div>

        {/* Domicilio */}
        <div className="md:col-span-2">
          <Label htmlFor="domicilio">Domicilio Completo</Label>
          <Input
            id="domicilio"
            value={formData.domicilio || ""}
            onChange={(e) => handleInputChange("domicilio", e.target.value)}
            aria-invalid={errors.domicilio || undefined}
            className={cn(errors.domicilio && "border-destructive")}
          />
        </div>

        {/* Nacionalidad */}
        <div>
          <Label htmlFor="nacionalidad">Nacionalidad</Label>
          <Input
            id="nacionalidad"
            value={formData.nacionalidad || ""}
            onChange={(e) => handleInputChange("nacionalidad", e.target.value)}
            aria-invalid={errors.nacionalidad || undefined}
            className={cn(errors.nacionalidad && "border-destructive")}
          />
        </div>
      </div>
    </div>
  );
}
