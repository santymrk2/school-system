"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, FileText, Users } from "lucide-react";

const CARD_DESCRIPTIONS = {
  personal: "Total de docentes y personal administrativo con legajo activo.",
  activos: "Personal que actualmente presta servicio en la institución.",
  licencias: "Integrantes con licencias activas según la situación declarada.",
  registradas: "Historial de licencias cargadas en el sistema.",
} as const;

type LicenseSummaryCardsProps = {
  totalPersonal: number;
  activos: number;
  enLicencia: number;
  totalLicencias: number;
  loadingLicencias?: boolean;
};

export function LicenseSummaryCards({
  totalPersonal,
  activos,
  enLicencia,
  totalLicencias,
  loadingLicencias = false,
}: LicenseSummaryCardsProps) {
  const cards = [
    {
      title: "Personal registrado",
      icon: Users,
      value: totalPersonal,
      description: CARD_DESCRIPTIONS.personal,
      iconClassName: "text-muted-foreground",
    },
    {
      title: "Activos",
      icon: CheckCircle,
      value: activos,
      description: CARD_DESCRIPTIONS.activos,
      iconClassName: "text-primary",
    },
    {
      title: "En licencia",
      icon: Clock,
      value: enLicencia,
      description: CARD_DESCRIPTIONS.licencias,
      iconClassName: "text-muted-foreground",
    },
    {
      title: "Licencias registradas",
      icon: FileText,
      value: loadingLicencias ? "—" : totalLicencias,
      description: CARD_DESCRIPTIONS.registradas,
      iconClassName: "text-muted-foreground",
    },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ title, icon: Icon, value, description, iconClassName }) => (
        <Card key={title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className={`h-4 w-4 ${iconClassName}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
