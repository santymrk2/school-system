"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import LoadingState from "@/components/common/LoadingState";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, CheckCircle, Clock, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import * as DTO from "@/types/api-generated";
import { admisiones, gestionAcademica, identidad } from "@/services/api/modules";

const ESTADOS = {
  PENDIENTE: "PENDIENTE",
  PROPUESTA: "PROPUESTA_ENVIADA",
  PROGRAMADA: "ENTREVISTA_PROGRAMADA",
  ENTREVISTA_REALIZADA: "ENTREVISTA_REALIZADA",
  ACEPTADA: "ACEPTADA",
  RECHAZADA: "RECHAZADA",
} as const;

const formatCurso = (curso?: DTO.Curso | string | null) => {
  if (!curso && curso !== 0) return "—";
  const base: Record<string, string> = {
    SALA_4: "Sala 4",
    SALA_5: "Sala 5",
    PRIMERO: "1° Grado",
    SEGUNDO: "2° Grado",
    TERCERO: "3° Grado",
    CUARTO: "4° Grado",
    QUINTO: "5° Grado",
    SEXTO: "6° Grado",
  };
  return base[String(curso)] ?? String(curso);
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const normalizeEstado = (estado?: string | null) =>
  String(estado ?? "").trim().toUpperCase();

const estadoBadge = (estado?: string | null) => {
  const e = normalizeEstado(estado);
  if (e === ESTADOS.PENDIENTE) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="h-3 w-3" /> Pendiente
      </Badge>
    );
  }
  if (e === ESTADOS.PROPUESTA || e === ESTADOS.PROGRAMADA) {
    return (
      <Badge variant="outline" className="gap-1">
        <Calendar className="h-3 w-3" /> Entrevista
      </Badge>
    );
  }
  if (e === ESTADOS.ENTREVISTA_REALIZADA || e === ESTADOS.ACEPTADA) {
    return (
      <Badge variant="default" className="gap-1">
        <CheckCircle className="h-3 w-3" /> {e === ESTADOS.ACEPTADA ? "Aceptada" : "Entrevista"}
      </Badge>
    );
  }
  if (e === ESTADOS.RECHAZADA) {
    return (
      <Badge variant="destructive" className="gap-1">
        <X className="h-3 w-3" /> Rechazada
      </Badge>
    );
  }
  return <Badge variant="secondary">{estado?.trim() || "—"}</Badge>;
};

const availabilityLabel = (solicitud: DTO.SolicitudAdmisionDTO) => {
  if (solicitud.disponibilidadCurso) return solicitud.disponibilidadCurso;
  if (solicitud.cupoDisponible == null) return "Pendiente";
  return solicitud.cupoDisponible ? "Disponible" : "Sin cupo";
};

type Props = {
  searchTerm: string;
};

type SolicitudAspirante = DTO.AspiranteDTO & {
  nombre?: string | null;
  apellido?: string | null;
  emailContacto?: string | null;
  email?: string | null;
  telefono?: string | null;
};

type SolicitudAdmisionItem = DTO.SolicitudAdmisionDTO & {
  aspirante?: SolicitudAspirante;
  aspirantePersona?: DTO.PersonaDTO | null;
};

const resolveAspiranteNombre = (solicitud: SolicitudAdmisionItem) => {
  const aspirante = solicitud.aspirante;
  const persona = solicitud.aspirantePersona;
  const nombre = aspirante?.nombre ?? persona?.nombre ?? "";
  const apellido = aspirante?.apellido ?? persona?.apellido ?? "";
  const fullName = `${nombre} ${apellido}`.trim();
  if (fullName) return fullName;
  if (persona?.dni) return `Aspirante DNI ${persona.dni}`;
  return `Solicitud #${solicitud.id}`;
};

const resolveAspiranteEmail = (solicitud: SolicitudAdmisionItem) => {
  const aspirante = solicitud.aspirante;
  const persona = solicitud.aspirantePersona;
  return aspirante?.emailContacto ?? aspirante?.email ?? persona?.email ?? "—";
};

const resolveAspiranteTelefono = (solicitud: SolicitudAdmisionItem) => {
  const aspirante = solicitud.aspirante;
  const persona = solicitud.aspirantePersona;
  return (
    aspirante?.telefono ??
    persona?.celular ??
    persona?.telefono ??
    "—"
  );
};

const puedeDarDeAltaSolicitud = (solicitud: SolicitudAdmisionItem) => {
  const estadoActual = normalizeEstado(solicitud.estado);
  return (
    Boolean(solicitud.entrevistaRealizada) ||
    estadoActual === ESTADOS.ENTREVISTA_REALIZADA ||
    estadoActual === ESTADOS.ACEPTADA
  );
};

function useSolicitudesAdmision(query: string) {
  const [data, setData] = useState<SolicitudAdmisionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await admisiones.solicitudesAdmision.list();
      const solicitudes = res.data ?? [];

      const personaIds = Array.from(
        new Set(
          solicitudes
            .map((item) => item.aspirante?.personaId)
            .filter((id): id is number => typeof id === "number"),
        ),
      );

      let personaById = new Map<number, DTO.PersonaDTO>();
      if (personaIds.length > 0) {
        try {
          const personasRes = await identidad.personasCore.getManyById(personaIds);
          const personas = personasRes.data ?? [];
          personaById = new Map(personas.map((persona) => [persona.id, persona]));
        } catch (personaErr) {
          // eslint-disable-next-line no-console
          console.error(
            "No se pudieron cargar los datos de las personas asociadas a las solicitudes",
            personaErr,
          );
        }
      }

      const enriched: SolicitudAdmisionItem[] = solicitudes.map((item) => ({
        ...item,
        aspirantePersona:
          item.aspirante?.personaId != null
            ? personaById.get(item.aspirante.personaId) ?? null
            : null,
      }));

      setData(enriched);
    } catch (e) {
      setError(e);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      await fetchAll();
      if (!alive) return;
    })();
    return () => {
      alive = false;
    };
  }, [fetchAll]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((item) => {
      const aspirante = item.aspirante;
      const persona = item.aspirantePersona;
      const nombre = resolveAspiranteNombre(item).toLowerCase();
      const curso = formatCurso(aspirante?.cursoSolicitado).toLowerCase();
      const estado = String(item.estado ?? "").toLowerCase();
      const dni = persona?.dni?.toLowerCase() ?? "";
      return (
        nombre.includes(q) ||
        curso.includes(q) ||
        estado.includes(q) ||
        dni.includes(q)
      );
    });
  }, [data, query]);

  return { data: filtered, loading, error, refetch: fetchAll };
}

export default function AspirantesTab({ searchTerm }: Props) {
  const {
    data: solicitudes,
    loading,
    error,
    refetch,
  } = useSolicitudesAdmision(searchTerm);

  const [altaOpen, setAltaOpen] = useState(false);
  const [altaSolicitud, setAltaSolicitud] = useState<SolicitudAdmisionItem | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 6;

  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  useEffect(() => {
    if (page * pageSize >= solicitudes.length && page > 0) {
      const nextPage = Math.max(0, Math.ceil(solicitudes.length / pageSize) - 1);
      setPage(nextPage);
    }
  }, [page, solicitudes.length, pageSize]);

  const totalPages = Math.ceil(solicitudes.length / pageSize);
  const startIndex = totalPages === 0 ? 0 : page * pageSize;
  const endIndex = Math.min(solicitudes.length, startIndex + pageSize);
  const currentSolicitudes = solicitudes.slice(startIndex, endIndex);

  const openAlta = (row: SolicitudAdmisionItem) => {
    setAltaSolicitud(row);
    setAltaOpen(true);
  };
  useEffect(() => {
    if (!altaOpen || !altaSolicitud) return;
    const next = solicitudes.find((item) => item.id === altaSolicitud.id);
    if (next && next !== altaSolicitud) {
      setAltaSolicitud(next);
    }
  }, [altaOpen, altaSolicitud, solicitudes]);

  if (loading) {
    return <LoadingState label="Cargando solicitudes…" />;
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 py-8">
        No se pudieron cargar las solicitudes.
        <Button variant="link" onClick={refetch} className="ml-2 p-0 h-auto">
          Reintentar
        </Button>
      </div>
    );
  }

  if (!solicitudes.length) {
    return (
      <div className="text-sm text-muted-foreground py-8">
        No hay solicitudes de admisión registradas.
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Aspirantes</CardTitle>
          <CardDescription>
            Gestioná las solicitudes recibidas: entrevistas, disponibilidad y decisiones finales.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {currentSolicitudes.map((row) => {
              const nombre = resolveAspiranteNombre(row);
              const cantidadPropuestas = row.cantidadPropuestasEnviadas ?? 0;
              const puedeDarDeAlta = puedeDarDeAltaSolicitud(row);
              return (
                <Card key={row.id} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base font-semibold">
                          {nombre || "—"}
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          Solicitud #{row.id} · {formatDate(row.fechaSolicitud)}
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {estadoBadge(row.estado)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">Curso</span>
                      <span>{formatCurso(row.aspirante?.cursoSolicitado)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">Disponibilidad</span>
                      <span>{availabilityLabel(row)}</span>
                    </div>
                    {cantidadPropuestas > 1 && (
                      <div className="text-xs text-muted-foreground">
                        {cantidadPropuestas} propuestas enviadas
                      </div>
                    )}
                    {row.reprogramacionSolicitada && (
                      <div className="text-xs text-muted-foreground">Reprogramación solicitada</div>
                    )}
                  </CardContent>
                  <div className="flex justify-end gap-2 border-t px-6 py-4">
                    {puedeDarDeAlta && (
                      <Button
                        size="sm"
                        onClick={() => openAlta(row)}
                        variant="default"
                      >
                        Dar de alta
                      </Button>
                    )}
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/alumnos/solicitudes/${row.id}`} prefetch={false}>
                        Ver detalle
                      </Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
            {!currentSolicitudes.length && (
              <div className="col-span-full text-sm text-muted-foreground">
                No hay solicitudes para esta página.
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 border-t pt-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <div>
              Mostrando {solicitudes.length === 0 ? 0 : startIndex + 1}-{endIndex} de {solicitudes.length} solicitud
              {solicitudes.length === 1 ? "" : "es"}.
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Anterior
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
                disabled={totalPages === 0 || page >= totalPages - 1}
              >
                Siguiente <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {altaSolicitud && (
        <AltaModal
          open={altaOpen}
          solicitud={altaSolicitud}
          onOpenChange={(open) => {
            setAltaOpen(open);
            if (!open) {
              setAltaSolicitud(null);
            }
          }}
          onSuccess={() => {
            refetch();
            setAltaSolicitud(null);
          }}
        />
      )}
    </>
  );
}

}

type AltaModalProps = {
  open: boolean;
  solicitud: SolicitudAdmisionItem;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

function AltaModal({ open, solicitud, onOpenChange, onSuccess }: AltaModalProps) {
  const [secciones, setSecciones] = useState<DTO.SeccionDTO[]>([]);
  const [seccionesLoading, setSeccionesLoading] = useState(false);
  const [seccionesError, setSeccionesError] = useState<string | null>(null);
  const [selectedSeccionId, setSelectedSeccionId] = useState<string>("");
  const [turno, setTurno] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const aspiranteNombre = resolveAspiranteNombre(solicitud);
  const turnoPreferido = solicitud.aspirante?.turnoPreferido ?? null;

  useEffect(() => {
    if (!open) {
      setSecciones([]);
      setSeccionesError(null);
      setSelectedSeccionId("");
      setTurno("");
      return;
    }

    const initialTurno = turnoPreferido ? String(turnoPreferido) : "";
    setTurno(initialTurno);
    setSelectedSeccionId("");
    setSeccionesLoading(true);
    setSeccionesError(null);

    (async () => {
      try {
        const res = await gestionAcademica.secciones.list();
        const data = res.data ?? [];
        setSecciones(data);
        let preselected: string | null = null;
        if (initialTurno) {
          const matching = data.find(
            (sec) =>
              String(sec.turno ?? "")
                .trim()
                .toUpperCase() === initialTurno,
          );
          if (matching?.id != null) {
            preselected = String(matching.id);
          }
        }
        if (!preselected && data.length === 1 && data[0].id != null) {
          preselected = String(data[0].id);
        }
        if (preselected) {
          setSelectedSeccionId(preselected);
        }
      } catch (error: any) {
        setSeccionesError(
          error?.message ?? "No se pudieron obtener las secciones disponibles",
        );
      } finally {
        setSeccionesLoading(false);
      }
    })();
  }, [open, solicitud.id, turnoPreferido]);

  useEffect(() => {
    if (!open || turno) return;
    const seccion = secciones.find((sec) => String(sec.id) === selectedSeccionId);
    if (seccion?.turno) {
      setTurno(String(seccion.turno));
    }
  }, [open, selectedSeccionId, secciones, turno]);

  const formatTurnoLabel = (value?: string | null) => {
    if (!value) return "";
    const normalized = String(value).trim().toUpperCase();
    if (normalized === DTO.Turno.MANANA) return "Mañana";
    if (normalized === DTO.Turno.TARDE) return "Tarde";
    return normalized;
  };

  const formatSeccionLabel = (seccion: DTO.SeccionDTO) => {
    const parts = [seccion.nivel, seccion.gradoSala, seccion.division]
      .map((part) => (part ?? "").toString().trim())
      .filter(Boolean);
    const base = parts.join(" ");
    const turnoLabel = formatTurnoLabel(seccion.turno);
    if (turnoLabel) {
      return `${base || "Sección"} (${turnoLabel})`;
    }
    return base || `Sección #${seccion.id}`;
  };

  const selectedSeccion = secciones.find((sec) => String(sec.id) === selectedSeccionId);

  const handleSubmit = async () => {
    if (!selectedSeccionId) {
      toast.error("Seleccioná una sección para el alta");
      return;
    }
    setSaving(true);
    try {
      await admisiones.solicitudesAdmision.alta(solicitud.id, {
        seccionId: Number(selectedSeccionId),
        turno: turno ? (turno as DTO.Turno) : undefined,
      });
      toast.success("Alumno dado de alta correctamente");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message ?? "No se pudo completar el alta");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Dar de alta — {aspiranteNombre}</DialogTitle>
          <DialogDescription>
            Migrá la solicitud a un alumno matriculado. Ajustá la sección y el turno antes de confirmar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
            <p>
              Curso solicitado: {formatCurso(solicitud.aspirante?.cursoSolicitado)}
            </p>
            <p>
              Disponibilidad informada: {availabilityLabel(solicitud)}
            </p>
            {turnoPreferido && (
              <p>
                Turno preferido registrado: {formatTurnoLabel(turnoPreferido)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Sección destino</Label>
            <Select
              value={selectedSeccionId}
              onValueChange={setSelectedSeccionId}
              disabled={seccionesLoading || !secciones.length}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná la sección" />
              </SelectTrigger>
              <SelectContent>
                {secciones.map((sec) => (
                  <SelectItem key={sec.id} value={String(sec.id)}>
                    {formatSeccionLabel(sec)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {seccionesLoading && (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Cargando secciones…
              </p>
            )}
            {seccionesError && (
              <p className="text-xs text-destructive">{seccionesError}</p>
            )}
            {!seccionesLoading && !secciones.length && !seccionesError && (
              <p className="text-xs text-muted-foreground">
                No hay secciones disponibles para matricular en este momento.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Turno</Label>
            <Select value={turno} onValueChange={setTurno}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccioná el turno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DTO.Turno.MANANA}>Mañana</SelectItem>
                <SelectItem value={DTO.Turno.TARDE}>Tarde</SelectItem>
              </SelectContent>
            </Select>
            {selectedSeccion?.turno && (
              <p className="text-xs text-muted-foreground">
                Turno sugerido por la sección: {formatTurnoLabel(selectedSeccion.turno)}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={saving || !selectedSeccionId}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirmar alta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { AltaModal };
