"use client";

import { useEffect, useMemo, useState } from "react";
import LoadingState from "@/components/common/LoadingState";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/dashboard/dashboard-layout";
import type * as DTO from "@/types/api-generated";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, UserPlus } from "lucide-react";
import { useScopedIndex } from "@/hooks/scope/useScopedIndex";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod";
import FamilyView from "./_components/FamilyView";
import AspirantesTab from "./_components/AspirantesTabs";
import { api } from "@/services/api";

export default function AlumnosIndexPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState<
    "alumnos" | "aspirantes" | "historial"
  >("alumnos");

  const [alumnos, setAlumnos] = useState<DTO.AlumnoDTO[]>([]);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);
  const [errorAlumnos, setErrorAlumnos] = useState<string | null>(null);
  const [seccionFiltro, setSeccionFiltro] = useState<string>("");

  const {
    scope,
    loading,
    error,
    secciones,
    hijos,
    periodoEscolarId,
  } = useScopedIndex({ includeTitularSec: true });

  // Mostramos período activo con el hook (evita UTC vs local)
  const { hoyISO } = useActivePeriod();

  useEffect(() => {
    if (scope === "family" || scope === "student") return;
    let cancelled = false;
    (async () => {
      setLoadingAlumnos(true);
      setErrorAlumnos(null);
      try {
        const res = await api.alumnos.list();
        if (!cancelled) setAlumnos(res.data ?? []);
      } catch (err: any) {
        if (!cancelled) setErrorAlumnos(err?.message ?? "No se pudieron cargar los alumnos");
      } finally {
        if (!cancelled) setLoadingAlumnos(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scope]);

  const seccionOptions = useMemo(() => {
    if (secciones.length) {
      return secciones.map((s) => ({
        id: String(s.id),
        label: `${s.gradoSala ?? ""} ${s.division ?? ""}`.trim() +
          (s.turno ? ` (${s.turno})` : ""),
      }));
    }
    const map = new Map<string, string>();
    alumnos.forEach((a) => {
      if (a.seccionActualId && a.seccionActualNombre) {
        map.set(String(a.seccionActualId), a.seccionActualNombre);
      }
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [secciones, alumnos]);

  const alumnosFiltrados = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return alumnos.filter((alumno) => {
      if (seccionFiltro && String(alumno.seccionActualId) !== seccionFiltro) {
        return false;
      }
      if (!q) return true;
      const nombre = `${alumno.nombre ?? ""} ${alumno.apellido ?? ""}`.toLowerCase();
      const dni = (alumno.dni ?? "").toLowerCase();
      const seccion = (alumno.seccionActualNombre ?? "").toLowerCase();
      return nombre.includes(q) || dni.includes(q) || seccion.includes(q);
    });
  }, [alumnos, searchTerm, seccionFiltro]);

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Alumnos</h2>
            <div className="text-muted-foreground">
              {scope === "staff"
                ? `Período escolar activo: #${periodoEscolarId ?? "—"} • Hoy: ${hoyISO}`
                : scope === "teacher"
                  ? "Gestión de alumnos por sección"
                  : scope === "student"
                    ? "Consulta de mi información académica"
                    : "Vista de hijos y perfiles"}
            </div>
          </div>
          {(scope === "staff" || scope === "teacher") && (
            <div className="flex items-center space-x-2">
              <Button onClick={() => router.push("/dashboard/alumnos/alta")}>
                <UserPlus className="h-4 w-4 mr-2" />
                Alta Manual
              </Button>
            </div>
          )}
        </div>

        {/* Search global (para Aspirantes / Historial) */}
        {(scope === "staff" || scope === "teacher") && (
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, curso o sección…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {loading && <LoadingState label="Cargando información…" />}
        {error && <div className="text-sm text-red-600">{String(error)}</div>}

        {/* FAMILY / STUDENT: lista de hijos o matrícula propia */}
        {!loading && !error && (scope === "family" || scope === "student") && (
          <FamilyView
            hijos={hijos}
            title={scope === "student" ? "Mi matrícula" : "Mis hijos/as"}
          />
        )}

        {/* STAFF / TEACHER: Tabs */}
        {!loading &&
          !error &&
          (scope === "staff" || scope === "teacher") && (
          <Tabs
            value={selectedTab}
            onValueChange={(v) => setSelectedTab(v as any)}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="alumnos">Alumnos</TabsTrigger>
              <TabsTrigger value="aspirantes">Aspirantes</TabsTrigger>
              <TabsTrigger value="historial">Historial</TabsTrigger>
            </TabsList>

            <TabsContent value="alumnos" className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Select
                  value={seccionFiltro}
                  onValueChange={(value) => setSeccionFiltro(value === "__all" ? "" : value)}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Todas las secciones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all">Todas las secciones</SelectItem>
                    {seccionOptions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {seccionFiltro && (
                  <Badge variant="outline">Filtrando por sección</Badge>
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Listado de alumnos</CardTitle>
                  <CardDescription>
                    Seleccioná un alumno para ver su ficha completa.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingAlumnos ? (
                    <LoadingState label="Cargando alumnos…" />
                  ) : errorAlumnos ? (
                    <div className="text-sm text-red-600 py-6">{errorAlumnos}</div>
                  ) : !alumnosFiltrados.length ? (
                    <div className="text-sm text-muted-foreground py-6">
                      No se encontraron alumnos con los filtros aplicados.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Apellido</TableHead>
                          <TableHead>DNI</TableHead>
                          <TableHead>Sección actual</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {alumnosFiltrados.map((alumno) => (
                          <TableRow
                            key={alumno.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => alumno.id && router.push(`/dashboard/alumnos/${alumno.id}`)}
                          >
                            <TableCell className="font-medium">
                              {alumno.nombre ?? "—"}
                            </TableCell>
                            <TableCell>{alumno.apellido ?? "—"}</TableCell>
                            <TableCell>{alumno.dni ?? "—"}</TableCell>
                            <TableCell>{alumno.seccionActualNombre ?? "Sin asignar"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aspirantes (placeholder / mock) */}
            <TabsContent value="aspirantes" className="space-y-4">
              <AspirantesTab searchTerm={searchTerm} />
            </TabsContent>

            {/* Historial (placeholder) */}
            <TabsContent value="historial" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Alumnos</CardTitle>
                  <CardDescription>Registro de egresos y bajas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    No hay registros por ahora.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
