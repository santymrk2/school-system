// components/Step4.tsx
"use client";

import React from "react";
import { Heart } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { PostulacionFormData } from "./types";

interface Step4Props {
  formData: PostulacionFormData;
  handleInputChange: (
    field: string,
    value: any,
    options?: { errorKeys?: string | string[] },
  ) => void;
}

export function Step4({ formData, handleInputChange }: Step4Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center mb-6">
        <Heart className="h-6 w-6 text-primary mr-2" />
        <h3 className="text-lg font-medium">Información de Salud</h3>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="enfermedadesAlergias">Enfermedades o Alergias</Label>
          <Textarea
            id="enfermedadesAlergias"
            value={formData.enfermedadesAlergias ?? ""}
            onChange={(e) =>
              handleInputChange("enfermedadesAlergias", e.target.value)
            }
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="medicacionHabitual">Medicación Habitual</Label>
          <Textarea
            id="medicacionHabitual"
            value={formData.medicacionHabitual ?? ""}
            onChange={(e) =>
              handleInputChange("medicacionHabitual", e.target.value)
            }
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="limitacionesFisicasNeurologicas">
            Limitaciones Físicas o Neurológicas
          </Label>
          <Textarea
            id="limitacionesFisicasNeurologicas"
            value={formData.limitacionesFisicasNeurologicas ?? ""}
            onChange={(e) =>
              handleInputChange(
                "limitacionesFisicasNeurologicas",
                e.target.value,
              )
            }
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="tratamientosTerapeuticos">
            Tratamientos Terapéuticos en Curso
          </Label>
          <Input
            id="tratamientosTerapeuticos"
            value={formData.tratamientosTerapeuticos ?? ""}
            onChange={(e) =>
              handleInputChange("tratamientosTerapeuticos", e.target.value)
            }
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="usoAyudasMovilidad"
            checked={formData.usoAyudasMovilidad ?? false}
            onCheckedChange={(c) =>
              handleInputChange("usoAyudasMovilidad", c as boolean)
            }
          />
          <Label htmlFor="usoAyudasMovilidad">Usa ayudas de movilidad</Label>
        </div>

        <div>
          <Label htmlFor="coberturaMedica">Cobertura Médica</Label>
          <Input
            id="coberturaMedica"
            value={formData.coberturaMedica ?? ""}
            onChange={(e) =>
              handleInputChange("coberturaMedica", e.target.value)
            }
          />
        </div>

        <div>
          <Label htmlFor="observacionesAdicionalesSalud">
            Observaciones Adicionales
          </Label>
          <Textarea
            id="observacionesAdicionalesSalud"
            value={formData.observacionesAdicionalesSalud ?? ""}
            onChange={(e) =>
              handleInputChange("observacionesAdicionalesSalud", e.target.value)
            }
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
