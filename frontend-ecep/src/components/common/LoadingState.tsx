import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type LoadingStateProps = {
  label?: string;
  className?: string;
  iconClassName?: string;
};

export default function LoadingState({
  label = "Cargando…",
  className,
  iconClassName,
}: LoadingStateProps) {
  return (
    <div className={cn("flex h-48 items-center justify-center", className)}>
      <Loader2 className={cn("h-6 w-6 animate-spin text-primary", iconClassName)} />
      <span className="ml-2 text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
