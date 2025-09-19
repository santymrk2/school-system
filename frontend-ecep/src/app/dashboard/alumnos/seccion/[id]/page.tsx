"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/dashboard/dashboard-layout";
import LoadingState from "@/components/common/LoadingState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAlumnosActivosSeccion } from "@/hooks/academico/useAlumnosActivosSeccion";

export default function SeccionAlumnosPage() {
  const params = useParams<{ id: string }>();
  const seccionId = Number(params.id);
  const router = useRouter();

  const { alumnos, loading, error } = useAlumnosActivosSeccion(seccionId);

  const prefetchPerfil = (alumnoId?: number | null) => {
    if (!alumnoId) return;
    try {
      router.prefetch(`/dashboard/alumnos/${alumnoId}`);
    } catch {
      /* no-op */
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/alumnos")}
        >
          Volver
        </Button>
        {/* Header sin filtros */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Alumnos por sección
          </h2>
          <div className="text-muted-foreground">Sección #{seccionId}</div>
        </div>

        {/* Contenido: solo alumnos */}
        {loading ? (
          <LoadingState label="Cargando alumnos…" />
        ) : error ? (
          <div className="text-sm text-red-600">
            Ocurrió un error al cargar los alumnos.
            <Button
              variant="link"
              className="ml-2 p-0 h-auto"
              onClick={() => router.refresh()}
            >
              Reintentar
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {alumnos.map((a) => (
              <Card
                key={a.matriculaId ?? `${a.alumnoId}-mat`}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {a.nombreCompleto}
                    </CardTitle>
                    <Badge variant="outline">#{a.matriculaId}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Link
                        href={`/dashboard/alumnos/${a.alumnoId ?? ""}`}
                        onMouseEnter={() => prefetchPerfil(a.alumnoId)}
                      >
                        Ver Perfil
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!alumnos.length && (
              <div className="text-sm text-muted-foreground">
                No hay alumnos para esta sección.
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
