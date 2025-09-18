"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AlumnoLiteDTO } from "@/types/api-generated";
import { useRouter } from "next/navigation";

export default function FamilyView({
  hijos,
  title = "Mis hijos/as",
}: {
  hijos: AlumnoLiteDTO[];
  title?: string;
}) {
  const router = useRouter();

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
        {hijos.map((hijo) => (
          <Card
            key={`${hijo.matriculaId}-${hijo.alumnoId}`}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{hijo.nombreCompleto}</CardTitle>
                <Badge variant="outline">#{hijo.matriculaId}</Badge>
              </div>
              {/* Evitamos <div> dentro de <p> (no usamos CardDescription) */}
              <div className="text-sm text-muted-foreground">
                Alumno ID: {hijo.alumnoId}
              </div>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  router.push(`/dashboard/alumno/${hijo.alumnoId}`)
                }
              >
                Ver perfil
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
