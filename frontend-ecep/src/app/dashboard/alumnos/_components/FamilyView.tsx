"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AlumnoLiteDTO } from "@/types/api-generated";
import { NivelAcademico } from "@/types/api-generated";

export default function FamilyView({
  hijos,
  title = "Mis hijos/as",
}: {
  hijos: AlumnoLiteDTO[];
  title?: string;
}) {
  const nivelLabel = (nivel?: NivelAcademico | null) => {
    if (!nivel) return null;
    switch (nivel) {
      case NivelAcademico.PRIMARIO:
        return "Nivel primario";
      case NivelAcademico.INICIAL:
        return "Nivel inicial";
      default:
        return String(nivel);
    }
  };

  if (!hijos?.length) {
    return (
      <div className="text-sm text-muted-foreground">
        No hay alumnos asociados a esta cuenta familiar.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {hijos.map((hijo) => {
          const nivelTexto = nivelLabel(hijo.nivel);
          return (
            <Card
              key={`${hijo.matriculaId}-${hijo.alumnoId}`}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3 space-y-2">
                <CardTitle className="text-lg">{hijo.nombreCompleto}</CardTitle>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {hijo.seccionNombre && (
                    <Badge variant="outline">{hijo.seccionNombre}</Badge>
                  )}
                  {nivelTexto && (
                    <Badge variant="secondary">{nivelTexto}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                {hijo.seccionNombre && (
                  <div>
                    <span className="font-medium text-foreground">Sección:</span>{" "}
                    {hijo.seccionNombre}
                  </div>
                )}
                {nivelTexto && (
                  <div>
                    <span className="font-medium text-foreground">Nivel:</span>{" "}
                    {nivelTexto}
                  </div>
                )}
                <div>
                  Consultá su información académica desde el menú lateral.
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
