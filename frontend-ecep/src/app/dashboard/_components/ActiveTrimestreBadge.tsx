"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod";
import { cn } from "@/lib/utils";
import { formatTrimestreRange, getTrimestreEstado } from "@/lib/trimestres";

interface ActiveTrimestreBadgeProps {
  className?: string;
}

export function ActiveTrimestreBadge({ className }: ActiveTrimestreBadgeProps) {
  const { trimestreActivo, loading } = useActivePeriod();

  if (loading) return null;

  const { label, description, variant } = useMemo(() => {
    if (!trimestreActivo) {
      return {
        label: "Sin trimestre activo",
        description: "",
        variant: "secondary" as const,
      };
    }
    const estado = getTrimestreEstado(trimestreActivo);
    const range = formatTrimestreRange(trimestreActivo) ?? "";
    const numero = trimestreActivo.orden ?? "";
    const numeroLabel = numero ? ` ${numero}` : "";
    const labelByEstado: Record<string, string> = {
      activo: `Trimestre${numeroLabel} activo`,
      "sin-estado": `Trimestre${numeroLabel} sin estado`,
    };
    return {
      label: labelByEstado[estado] ?? `Trimestre ${numero}`,
      description: range,
      variant: estado === "activo" ? "outline" : "secondary",
    };
  }, [trimestreActivo]);

  if (!label && !description) return null;

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
