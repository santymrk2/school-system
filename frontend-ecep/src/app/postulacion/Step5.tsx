// components/Step5.tsx
"use client";

import React from "react";
import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Curso, Turno } from "@/types/api-generated";
import type { PostulacionFormData } from "./types";

interface Step5Props {
  formData: PostulacionFormData;
  communicationsAuthorized: boolean;
  setCommunicationsAuthorized: (v: boolean) => void;
}

export function Step5({
  formData,
  communicationsAuthorized,
  setCommunicationsAuthorized,
}: Step5Props) {
  const {
    nombre,
    apellido,
    dni,
    cursoSolicitado,
    turnoPreferido,
    familiares = [],
  } = formData;

  function labelForCurso() {
    switch (cursoSolicitado) {
      case Curso.SALA_4.toString():
        return "Sala de 4 años";
      case Curso.SALA_5.toString():
        return "Sala de 5 años";
      case Curso.PRIMERO.toString():
        return "1° Grado";
      case Curso.SEGUNDO.toString():
        return "2° Grado";
      case Curso.TERCERO.toString():
        return "3° Grado";
      case Curso.CUARTO.toString():
        return "4° Grado";
      case Curso.QUINTO.toString():
        return "5° Grado";
      case Curso.SEXTO.toString():
        return "6° Grado";
      default:
        return "No seleccionado";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Check className="h-6 w-6 text-primary mr-2" />
        <h3 className="text-lg font-medium">Confirmación de Datos</h3>
      </div>

      <div className="rounded-lg bg-muted p-4 text-sm space-y-1">
        <p>
          <strong>Aspirante:</strong> {nombre} {apellido}
        </p>
        <p>
          <strong>DNI:</strong> {dni}
        </p>
        <p>
          <strong>Curso:</strong> {labelForCurso()}
        </p>
        <p>
          <strong>Turno:</strong>{" "}
          {turnoPreferido === Turno.MANANA.toString()
            ? "Mañana"
            : turnoPreferido === Turno.TARDE.toString()
              ? "Tarde"
              : "No seleccionado"}
        </p>
        <p>
          <strong>Familiares:</strong> {familiares.length}
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="autorizadoComunicacionesEmail"
          checked={communicationsAuthorized}
          onCheckedChange={(c) => setCommunicationsAuthorized(c as boolean)}
        />
        <Label htmlFor="autorizadoComunicacionesEmail" className="text-sm">
          Autorizo a recibir comunicaciones por correo electrónico
        </Label>
      </div>

      <div className="rounded-lg bg-primary/10 p-4 text-sm text-primary">
        Una vez enviada la postulación, recibirá un correo electrónico con un
        resumen de la información proporcionada. El resultado de la postulación
        será comunicado en los próximos días.
      </div>
    </div>
  );
}
