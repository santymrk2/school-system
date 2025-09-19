"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import type { MateriaDTO, SeccionDTO } from "@/types/api-generated";
import { toast } from "sonner";

type Materia = MateriaDTO;
type Seccion = SeccionDTO;

export default function AddMateriaToSeccionDialog({
  seccion,
  materias = [], // <-- default seguro
  ocupadas,
  onClose,
  onCreated,
}: {
  seccion: Seccion;
  materias?: Materia[];
  ocupadas?: Set<number>;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [nombre, setNombre] = useState("");
  const [selectedMateriaId, setSelectedMateriaId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const ocupadasSet = useMemo(
    () => (ocupadas ? new Set(Array.from(ocupadas)) : new Set<number>()),
    [ocupadas],
  );

  const materiaOptions = useMemo(() => {
    return (materias ?? [])
      .filter((m) => m?.id != null && !ocupadasSet.has(m.id))
      .map((m) => ({ id: m.id, label: m.nombre ?? `Materia #${m.id}` }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [materias, ocupadasSet]);

  const normalizedTerm = nombre.trim().toLowerCase();
  const suggestions = useMemo(() => {
    if (!normalizedTerm) return materiaOptions.slice(0, 5);
    return materiaOptions
      .filter((opt) => opt.label.toLowerCase().includes(normalizedTerm))
      .slice(0, 5);
  }, [materiaOptions, normalizedTerm]);

  const canSubmit = nombre.trim().length >= 2;

  const crear = async () => {
    if (!canSubmit || saving) return;
    try {
      setSaving(true);
      const trimmed = nombre.trim();
      if (selectedMateriaId != null) {
        await api.seccionMaterias.create({
          seccionId: seccion.id,
          materiaId: selectedMateriaId,
        });
      } else {
        const id = (await api.materias.create({ nombre: trimmed })).data as number;
        await api.seccionMaterias.create({
          seccionId: seccion.id,
          materiaId: id,
        });
      }
      onCreated();
      onClose();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ??
          e?.message ??
          "No se pudo agregar la materia a la sección.",
      );
    } finally {
      setSaving(false);
    }
  };

  const labelSec =
    `${seccion.gradoSala ?? ""} ${seccion.division ?? ""}`.trim() ||
    `Sección #${seccion.id}`;

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar materia</DialogTitle>
          <DialogDescription>Sección: {labelSec}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Nombre de la materia"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              setSelectedMateriaId(null);
            }}
          />

          {nombre.trim().length > 0 && suggestions.length > 0 && (
            <div className="border rounded-md divide-y">
              {suggestions.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => {
                    setNombre(option.label);
                    setSelectedMateriaId(option.id);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {nombre.trim().length > 0 && suggestions.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No se encontraron coincidencias. Se creará una materia nueva.
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={crear} disabled={!canSubmit || saving}>
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
