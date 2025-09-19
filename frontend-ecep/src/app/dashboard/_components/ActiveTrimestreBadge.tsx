"use client";

import type { ComponentProps } from "react";

import { Badge } from "@/components/ui/badge";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod";
import { cn } from "@/lib/utils";
import {
  formatTrimestreRange,
  getTrimestreEstado,
  TRIMESTRE_ESTADO_LABEL,
} from "@/lib/trimestres";

interface ActiveTrimestreBadgeProps {
  className?: string;
}

export function ActiveTrimestreBadge({ className }: ActiveTrimestreBadgeProps) {
  const { trimestreActivo, loading } = useActivePeriod();

  let label = "Sin trimestre activo";
  let description = "";
  let variant: ComponentProps<typeof Badge>["variant"] = "secondary";

  if (trimestreActivo) {
    const estado = getTrimestreEstado(trimestreActivo);
    const range = formatTrimestreRange(trimestreActivo);
    const numero = trimestreActivo.orden;
    const numeroLabel = numero ? ` ${numero}` : "";

    description = range ?? "";

    const estadoBaseLabel = TRIMESTRE_ESTADO_LABEL[estado] ?? estado;

    switch (estado) {
      case "activo":
        label = `Trimestre${numeroLabel} ${estadoBaseLabel.toLowerCase()}`;
        variant = "outline";
        break;
      case "cerrado":
        label = `Trimestre${numeroLabel} ${estadoBaseLabel.toLowerCase()}`;
        variant = "secondary";
        break;
      case "inactivo":
      default:
        label = `Trimestre${numeroLabel} ${estadoBaseLabel.toLowerCase()}`;
        variant = "secondary";
        break;
    }
  }

  if (loading || (!label && !description)) return null;


  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 text-xs text-muted-foreground",
        className,
      )}
    >
      <Badge variant={variant} className="whitespace-nowrap">
        {label}
      </Badge>
      {description ? <span>{description}</span> : null}
    </div>
  );
}
