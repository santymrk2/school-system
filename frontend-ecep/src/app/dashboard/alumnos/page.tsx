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
import { Search, UserPlus } from "lucide-react";
import { useScopedIndex } from "@/hooks/scope/useScopedIndex";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod";
import FamilyView from "./_components/FamilyView";
import AspirantesTab from "./_components/AspirantesTabs";
import { identidad } from "@/services/api/modules";

const TURNO_LABELS: Record<string, string> = {
  MANANA: "Mañana",
  TARDE: "Tarde",
};

function normalizeTurnoKey(turno: string) {
  return turno
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

function formatTurnoLabel(turno?: string | null) {
  if (!turno) return null;
  const trimmed = turno.trim();
  const normalized = normalizeTurnoKey(trimmed);
  if (normalized in TURNO_LABELS) {
    return TURNO_LABELS[normalized];
  }
  return trimmed;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanSeccionNombre(
  nombre?: string | null,
  turnoRaw?: string | null,
  turnoLabel?: string | null,
) {
  const base = nombre?.trim();
  if (!base) return undefined;

  const variants = [turnoRaw, turnoLabel]
    .flatMap((variant) => {
      const trimmed = variant?.trim();
      if (!trimmed) return [];
      const normalized = normalizeTurnoKey(trimmed);
      const values = [trimmed, trimmed.toLowerCase()];
      if (normalized) {
        values.push(normalized, normalized.toLowerCase());
      }
      return Array.from(new Set(values));
    })
    .filter((variant): variant is string => Boolean(variant));

  for (const variant of variants) {
    const core = escapeRegExp(variant);
    const pattern = new RegExp(
      `\\s*\\(\\s*(?:turno\\s+)?${core}\\s*\\)$`,
      "i",
    );
    const cleaned = base.replace(pattern, "").trim();
    if (cleaned !== base) {
      return cleaned || base;
    }
  }

  const fallbackPattern = /\s*\(\s*turno[^)]*\)\s*$/i;
  const cleaned = base.replace(fallbackPattern, "").trim();
  if (cleaned && cleaned !== base) {
    return cleaned;
  }

  return base;
}

export default function AlumnosIndexPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState<
    "alumnos" | "aspirantes" | "historial"
  >("alumnos");

  const PAGE_SIZE = 25;
  const [alumnos, setAlumnos] = useState<DTO.AlumnoDTO[]>([]);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);
  const [errorAlumnos, setErrorAlumnos] = useState<string | null>(null);
  const [seccionFiltro, setSeccionFiltro] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

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
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (scope !== "teacher") return;
    if (!secciones.length) {
      setSeccionFiltro("");
      return;
    }
    if (seccionFiltro && secciones.some((s) => String(s.id) === seccionFiltro)) {
      return;
    }
    const first = secciones[0];
    if (first?.id) {
      setSeccionFiltro(String(first.id));
    }
  }, [scope, secciones, seccionFiltro]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, seccionFiltro, scope]);

  useEffect(() => {
    if (scope === "family" || scope === "student") return;
    if (selectedTab !== "alumnos") return;

    if (scope === "teacher" && secciones.length === 0) {
      setLoadingAlumnos(false);
      setAlumnos([]);
      setTotalItems(0);
      setTotalPages(0);
      setErrorAlumnos(null);
      return;
    }

    const parsedSeccionId =
      seccionFiltro && seccionFiltro !== ""
        ? Number.parseInt(seccionFiltro, 10)
        : Number.NaN;
    const validSeccionId = Number.isFinite(parsedSeccionId)
      ? parsedSeccionId
      : undefined;

    if (scope === "teacher" && validSeccionId == null) {
      setLoadingAlumnos(false);
      setAlumnos([]);
      setTotalItems(0);
      setTotalPages(0);
      setErrorAlumnos(null);
      return;
    }

    let cancelled = false;
    setLoadingAlumnos(true);
    setErrorAlumnos(null);

    const params: {
      page: number;
      size: number;
      search?: string;
      seccionId?: number;
    } = {
      page,
      size: PAGE_SIZE,
    };

    const searchValue = debouncedSearch.trim();
    if (searchValue) {
      params.search = searchValue;
    }

    if (validSeccionId != null) {
      params.seccionId = validSeccionId;
    }

    identidad.alumnos
      .listPaged(params)
      .then((res) => {
        if (cancelled) return;
        const data = res.data;
        setAlumnos(data?.content ?? []);
        setTotalItems(data?.totalElements ?? 0);
        setTotalPages(data?.totalPages ?? 0);
        const nextPage = typeof data?.number === "number" ? data.number : page;
        if (nextPage !== page) {
          setPage(nextPage);
        }
        const reportedSize = typeof data?.size === "number" ? data.size : PAGE_SIZE;
        setPageSize(reportedSize);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setErrorAlumnos(err?.message ?? "No se pudieron cargar los alumnos");
        setAlumnos([]);
        setTotalItems(0);
        setTotalPages(0);
      })
      .finally(() => {
        if (!cancelled) setLoadingAlumnos(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    scope,
    selectedTab,
    secciones,
    seccionFiltro,
    debouncedSearch,
    page,
  ]);

  const teacherWithoutSecciones = scope === "teacher" && secciones.length === 0;
  const teacherNeedsSelection =
    scope === "teacher" && !teacherWithoutSecciones && !seccionFiltro;
  const seccionPlaceholder =
    scope === "teacher" ? "Seleccioná una sección" : "Todas las secciones";
  const showingFrom =
    totalItems === 0 || alumnos.length === 0 ? 0 : page * pageSize + 1;
  const showingTo =
    totalItems === 0 || alumnos.length === 0
      ? 0
      : Math.min(showingFrom + alumnos.length - 1, totalItems);

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
          {scope === "staff" && (
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
                  value={seccionFiltro || undefined}
                  onValueChange={(value) =>
                    setSeccionFiltro(value === "__all" ? "" : value)
                  }
                  disabled={teacherWithoutSecciones}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder={seccionPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {scope === "staff" && (
                      <SelectItem value="__all">Todas las secciones</SelectItem>
                    )}
                    {seccionOptions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {scope === "staff" && seccionFiltro && (
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
                  {teacherWithoutSecciones ? (
                    <div className="text-sm text-muted-foreground py-6">
                      No tenés secciones asignadas para ver alumnos.
                    </div>
                  ) : teacherNeedsSelection ? (
                    <div className="text-sm text-muted-foreground py-6">
                      Seleccioná una sección para ver los alumnos asignados.
                    </div>
                  ) : loadingAlumnos ? (
                    <LoadingState label="Cargando alumnos…" />
                  ) : errorAlumnos ? (
                    <div className="text-sm text-red-600 py-6">{errorAlumnos}</div>
                  ) : alumnos.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-6">
                      No se encontraron alumnos con los filtros aplicados.
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {alumnos.map((alumno) => {
                          const alumnoId = alumno.id;
                          const nombre = alumno.nombre?.trim() || "—";
                          const apellido = alumno.apellido?.trim() || "—";
                          const dni = alumno.dni?.trim() || "—";
                          const turnoRaw = alumno.seccionActualTurno?.trim();
                          const turnoLabel = formatTurnoLabel(turnoRaw);
                          const seccionNombre =
                            cleanSeccionNombre(
                              alumno.seccionActualNombre,
                              turnoRaw,
                              turnoLabel,
                            ) || "Sin asignar";
                          const turno = turnoLabel ?? turnoRaw ?? "—";

                          return (
                            <button
                              key={alumnoId ?? `${nombre}-${apellido}-${dni}`}
                              type="button"
                              onClick={() =>
                                alumnoId && router.push(`/dashboard/alumnos/${alumnoId}`)
                              }
                              className="h-full w-full rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                            >
                              <Card className="h-full transition hover:shadow-md">
                                <CardContent className="space-y-4 pt-6 text-sm">
                                  <dl className="grid gap-1">
                                    <dt className="text-xs font-medium uppercase text-muted-foreground">
                                      Nombre
                                    </dt>
                                    <dd className="text-base font-semibold text-foreground">
                                      {nombre}
                                    </dd>
                                  </dl>
                                  <dl className="grid gap-1">
                                    <dt className="text-xs font-medium uppercase text-muted-foreground">
                                      Apellido
                                    </dt>
                                    <dd className="text-base font-semibold text-foreground">
                                      {apellido}
                                    </dd>
                                  </dl>
                                  <dl className="grid gap-1">
                                    <dt className="text-xs font-medium uppercase text-muted-foreground">
                                      DNI
                                    </dt>
                                    <dd className="text-base font-semibold text-foreground">
                                      {dni}
                                    </dd>
                                  </dl>
                                  <dl className="grid gap-1">
                                    <dt className="text-xs font-medium uppercase text-muted-foreground">
                                      Sección actual
                                    </dt>
                                    <dd className="text-base font-semibold text-foreground">
                                      {seccionNombre}
                                    </dd>
                                  </dl>
                                  <dl className="grid gap-1">
                                    <dt className="text-xs font-medium uppercase text-muted-foreground">
                                      Turno
                                    </dt>
                                    <dd className="text-base font-semibold text-foreground">
                                      {turno}
                                    </dd>
                                  </dl>
                                </CardContent>
                              </Card>
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-4 flex flex-col gap-2 border-t pt-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                        <div>
                          Mostrando {showingFrom}-{showingTo} de {totalItems} alumno
                          {totalItems === 1 ? "" : "s"}.
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                            disabled={page === 0 || loadingAlumnos}
                          >
                            Anterior
                          </Button>
                          <div>
                            Página {totalPages === 0 ? 0 : page + 1} de {totalPages}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPage((prev) => {
                                if (totalPages === 0) return prev;
                                return Math.min(totalPages - 1, Math.max(0, prev + 1));
                              })
                            }
                            disabled={
                              totalPages === 0 || page >= totalPages - 1 || loadingAlumnos
                            }
                          >
                            Siguiente
                          </Button>
                        </div>
                      </div>
                    </>
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
