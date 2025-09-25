import { Circle, Lock, Minus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TRIMESTRE_ESTADO_LABEL, type TrimestreEstado } from "@/lib/trimestres";
import { cn } from "@/lib/utils";

const CIRCLE_STYLES: Record<TrimestreEstado, string> = {
  activo:
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200",
  inactivo: "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground",
  cerrado: "bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-300",
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
    "flex h-4 w-4 items-center justify-center rounded-full text-current",
    CIRCLE_STYLES[estado],
    circleClassName,
  );
  const iconClasses = cn("h-2 w-2", iconClassName);

  let icon = null;
  switch (estado) {
    case "activo":
      icon = (
        <Circle
          className={iconClasses}
          stroke="none"
          strokeWidth={0}
          fill="currentColor"
        />
      );
      break;
    case "inactivo":
      icon = (
        <Circle
          className={iconClasses}
          strokeWidth={0}
          stroke="none"
          fill="currentColor"
        />
      );
      break;
    case "cerrado":
    default:
      icon = (
        <Circle
          className={iconClasses}
          stroke="none"
          strokeWidth={0}
          fill="currentColor"
        />
      );
      break;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center gap-2 text-xs font-medium",
              className,
            )}
          >
            <span className={circleClasses} aria-hidden="true">
              {icon}
            </span>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">
          {showLabel ? (
            <span>{finalLabel}</span>
          ) : finalLabel ? (
            <span className="sr-only">{finalLabel}</span>
          ) : null}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
