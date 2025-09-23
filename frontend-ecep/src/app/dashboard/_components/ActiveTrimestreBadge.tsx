"use client";

import { TrimestreEstadoBadge } from "@/components/trimestres/TrimestreEstadoBadge";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod";
import { cn } from "@/lib/utils";
import {
  formatTrimestreRange,
  getTrimestreEstado,
  TRIMESTRE_ESTADO_LABEL,
  type TrimestreEstado,
} from "@/lib/trimestres";

interface ActiveTrimestreBadgeProps {
  className?: string;
}

export function ActiveTrimestreBadge({ className }: ActiveTrimestreBadgeProps) {
  const { trimestreActivo, loading } = useActivePeriod();

  let estado: TrimestreEstado = "inactivo";
  let label = "Sin trimestre activo";
  let description = "";

  if (trimestreActivo) {
    estado = getTrimestreEstado(trimestreActivo);
    const range = formatTrimestreRange(trimestreActivo);
    const numero = trimestreActivo.orden;
    const numeroLabel = numero ? ` ${numero}` : "";

    description = range ?? "";

    const estadoBaseLabel = TRIMESTRE_ESTADO_LABEL[estado] ?? estado;
    label = `Trimestre${numeroLabel} ${estadoBaseLabel.toLowerCase()}`;
  }

  if (loading || (!label && !description)) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 text-xs text-muted-foreground",
        className,
      )}
    >
      <TrimestreEstadoBadge
        estado={estado}
        label={label}
        className="whitespace-nowrap"
      />
      {description ? <span>{description}</span> : null}
    </div>
  );
}
