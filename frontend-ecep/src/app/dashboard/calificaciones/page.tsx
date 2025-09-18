"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/dashboard/dashboard-layout";
import { api } from "@/services/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function CalificacionesIndexPage() {
  const router = useRouter();
  const [secciones, setSecciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"primario" | "inicial">("primario");

  const formatTurnoLabel = (turno?: string | null) => {
    if (!turno) return "—";
    const map: Record<string, string> = { MANANA: "Mañana", TARDE: "Tarde" };
    return map[String(turno).toUpperCase()] ?? turno;
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.secciones.list();
        if (!alive) return;
        setSecciones(data ?? []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const primario = useMemo(
    () =>
      (secciones ?? []).filter(
        (s: any) => String(s.nivel ?? "").toUpperCase() === "PRIMARIO",
      ),
    [secciones],
  );
  const inicial = useMemo(
    () =>
      (secciones ?? []).filter(
        (s: any) => String(s.nivel ?? "").toUpperCase() === "INICIAL",
      ),
    [secciones],
  );

  useEffect(() => {
    if (loading) return;
    if (primario.length === 0 && inicial.length > 0) {
      setTab("inicial");
    }
    if (inicial.length === 0 && primario.length > 0) {
      setTab("primario");
    }
  }, [loading, primario.length, inicial.length]);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Calificaciones</h2>
        {!loading && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">Primario: {primario.length}</Badge>
            <Badge variant="outline">Inicial: {inicial.length}</Badge>
          </div>
        )}
        {loading && <div className="text-sm">Cargando…</div>}

        {!loading && (
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as "primario" | "inicial")}
            className="flex flex-col gap-6"
          >
            <TabsList className="inline-flex flex-wrap items-center gap-2 self-start">
              <TabsTrigger value="primario">Primario</TabsTrigger>
              <TabsTrigger value="inicial">Inicial</TabsTrigger>
            </TabsList>

            <TabsContent value="primario" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Gestión de calificaciones trimestrales por materia.
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {primario.map((s: any) => (
                  <Card
                    key={s.id}
                    className="hover:shadow-md transition cursor-pointer"
                    onClick={() =>
                      router.push(`/dashboard/calificaciones/seccion/${s.id}`)
                    }
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-lg">
                        <span>
                          {s.gradoSala} {s.division}
                        </span>
                        <Badge variant="secondary">
                          {formatTurnoLabel(s.turno)}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Cierre trimestral por materia (nota conceptual)
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
              {primario.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No hay secciones de Primario disponibles.
                </div>
              )}
            </TabsContent>

            <TabsContent value="inicial" className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Seguimiento de informes cualitativos por trimestre.
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {inicial.map((s: any) => (
                  <Card
                    key={s.id}
                    className="hover:shadow-md transition cursor-pointer"
                    onClick={() =>
                      router.push(`/dashboard/calificaciones/seccion/${s.id}`)
                    }
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-lg">
                        <span>
                          {s.gradoSala} {s.division}
                        </span>
                        <Badge variant="secondary">
                          {formatTurnoLabel(s.turno)}
                        </Badge>
                      </CardTitle>
                      <CardDescription>Informes por trimestre</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
              {inicial.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No hay secciones de Inicial disponibles.
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
