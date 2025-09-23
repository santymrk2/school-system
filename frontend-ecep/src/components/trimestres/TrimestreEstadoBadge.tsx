import { Dot, Lock, Minus } from "lucide-react";

import { TRIMESTRE_ESTADO_LABEL, type TrimestreEstado } from "@/lib/trimestres";
import { cn } from "@/lib/utils";

const CIRCLE_STYLES: Record<TrimestreEstado, string> = {
  activo: "bg-emerald-500 text-emerald-50 border-transparent",
  inactivo: "bg-white text-foreground border-border",
  cerrado: "bg-red-500 text-red-50 border-transparent",
};

export interface TrimestreEstadoBadgeProps {
  estado: TrimestreEstado;
  label?: string;
  showLabel?: boolean;
  className?: string;
  circleClassName?: string;
  iconClassName?: string;
}

export function TrimestreEstadoBadge({
  estado,
  label,
  showLabel = true,
  className,
  circleClassName,
  iconClassName,
}: TrimestreEstadoBadgeProps) {
  const finalLabel = label ?? TRIMESTRE_ESTADO_LABEL[estado] ?? "";
  const circleClasses = cn(
    "flex h-6 w-6 items-center justify-center rounded-full border text-current",
    CIRCLE_STYLES[estado],
    circleClassName,
  );
  const iconClasses = cn("h-3.5 w-3.5", iconClassName);

  let icon = null;
  switch (estado) {
    case "activo":
      icon = <Dot className={iconClasses} strokeWidth={6} fill="currentColor" />;
      break;
    case "inactivo":
      icon = <Minus className={iconClasses} strokeWidth={3} />;
      break;
    case "cerrado":
    default:
      icon = <Lock className={iconClasses} strokeWidth={2.5} />;
      break;
  }

  return (
    <span className={cn("inline-flex items-center gap-2 text-xs font-medium", className)}>
      <span className={circleClasses} aria-hidden="true">
        {icon}
      </span>
      {showLabel ? (
        <span>{finalLabel}</span>
      ) : finalLabel ? (
        <span className="sr-only">{finalLabel}</span>
      ) : null}
    </span>
  );
}
