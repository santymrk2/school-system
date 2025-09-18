"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Mail,
  Phone,
  X,
} from "lucide-react";
import type * as DTO from "@/types/api-generated";
import { api } from "@/services/api";

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

const estadoBadge = (estado?: string | null) => {
  const e = String(estado ?? "").toUpperCase();
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
  return <Badge variant="secondary">{estado ?? "—"}</Badge>;
};

const availabilityLabel = (solicitud: DTO.SolicitudAdmisionDTO) => {
  if (solicitud.disponibilidadCurso) return solicitud.disponibilidadCurso;
  if (solicitud.cupoDisponible == null) return "Pendiente";
  return solicitud.cupoDisponible ? "Disponible" : "Sin cupo";
};

type Props = {
  searchTerm: string;
};

function useSolicitudesAdmision(query: string) {
  const [data, setData] = useState<DTO.SolicitudAdmisionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.solicitudesAdmision.list();
      setData(res.data ?? []);
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
      const nombre = `${aspirante?.nombre ?? ""} ${aspirante?.apellido ?? ""}`.toLowerCase();
      const curso = formatCurso(aspirante?.cursoSolicitado).toLowerCase();
      const estado = String(item.estado ?? "").toLowerCase();
      return nombre.includes(q) || curso.includes(q) || estado.includes(q);
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

  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<DTO.SolicitudAdmisionDTO | null>(null);
  const [promptInterviewOpen, setPromptInterviewOpen] = useState(false);

  const openDetail = (row: DTO.SolicitudAdmisionDTO) => {
    setSelected(row);
    setDetailOpen(true);
  };

  useEffect(() => {
    if (!detailOpen || !selected) {
      setPromptInterviewOpen(false);
      return;
    }
    const estado = String(selected.estado ?? "").toUpperCase();
    if (
      estado === ESTADOS.PROGRAMADA &&
      selected.fechaEntrevistaConfirmada &&
      !selected.entrevistaRealizada
    ) {
      const fecha = new Date(selected.fechaEntrevistaConfirmada);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      fecha.setHours(0, 0, 0, 0);
      if (fecha <= hoy) {
        setPromptInterviewOpen(true);
      }
    }
  }, [detailOpen, selected]);

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground py-8">
        Cargando solicitudes…
      </div>
    );
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
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Disponibilidad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solicitudes.map((row) => {
                const nombre = `${row.aspirante?.nombre ?? ""} ${row.aspirante?.apellido ?? ""}`.trim();
                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{nombre || "—"}</TableCell>
                    <TableCell>{formatCurso(row.aspirante?.cursoSolicitado)}</TableCell>
                    <TableCell>{estadoBadge(row.estado)}</TableCell>
                    <TableCell>{availabilityLabel(row)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => openDetail(row)}>
                        Gestionar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selected && (
        <SolicitudDetailDialog
          open={detailOpen}
          onOpenChange={(open) => {
            setDetailOpen(open);
            if (!open) {
              setSelected(null);
              refetch();
            }
          }}
          solicitud={selected}
          onUpdated={refetch}
          promptInterviewOpen={promptInterviewOpen}
          setPromptInterviewOpen={setPromptInterviewOpen}
        />
      )}
    </>
  );
}

type DetailProps = {
  open: boolean;
  solicitud: DTO.SolicitudAdmisionDTO;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
  promptInterviewOpen: boolean;
  setPromptInterviewOpen: (open: boolean) => void;
};

function SolicitudDetailDialog({
  open,
  solicitud,
  onOpenChange,
  onUpdated,
  promptInterviewOpen,
  setPromptInterviewOpen,
}: DetailProps) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [confirmDateOpen, setConfirmDateOpen] = useState(false);
  const [decisionOpen, setDecisionOpen] = useState<"aceptar" | "rechazar" | null>(null);
  const [loading, setLoading] = useState(false);

  const estado = String(solicitud.estado ?? "").toUpperCase();
  const propuestas = solicitud.fechasPropuestas ?? [];
  const fechaConfirmada = solicitud.fechaEntrevistaConfirmada;

  const reset = () => {
    setRejectOpen(false);
    setScheduleOpen(false);
    setConfirmDateOpen(false);
    setDecisionOpen(null);
    setPromptInterviewOpen(false);
  };

  const handleRechazo = async (motivo: string) => {
    if (!motivo.trim()) {
      toast.error("Indicá un motivo para rechazar");
      return;
    }
    try {
      setLoading(true);
      await api.solicitudesAdmision.rechazar(solicitud.id, { motivo });
      toast.success("Solicitud rechazada");
      onUpdated();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message ?? "No se pudo rechazar");
    } finally {
      setLoading(false);
      reset();
    }
  };

  const handleProgramar = async (form: ScheduleFormState) => {
    const fechas = form.fechas.filter(Boolean) as string[];
    if (fechas.length === 0) {
      toast.error("Ingresá al menos una fecha propuesta");
      return;
    }
    try {
      setLoading(true);
      await api.solicitudesAdmision.programar(solicitud.id, {
        fechasPropuestas: fechas,
        documentosRequeridos: form.documentos || undefined,
        adjuntosInformativos: form.adjuntos.length ? form.adjuntos : undefined,
        cupoDisponible:
          form.cupoDisponible === null ? undefined : form.cupoDisponible,
        disponibilidadCurso: form.disponibilidad.trim() || undefined,
      });
      toast.success("Se envió la propuesta de entrevista");
      onUpdated();
      onOpenChange(false);
      reset();
    } catch (error: any) {
      toast.error(error?.message ?? "No se pudo programar la entrevista");
    } finally {
      setLoading(false);
      setScheduleOpen(false);
    }
  };

  const handleConfirmarFecha = async (fecha: string) => {
    try {
      setLoading(true);
      await api.solicitudesAdmision.confirmarFecha(solicitud.id, {
        fechaSeleccionada: fecha,
      });
      toast.success("Fecha de entrevista confirmada");
      onUpdated();
      onOpenChange(false);
      reset();
    } catch (error: any) {
      toast.error(error?.message ?? "No se pudo registrar la fecha");
    } finally {
      setLoading(false);
      setConfirmDateOpen(false);
    }
  };

  const handleResultadoEntrevista = async (realizada: boolean) => {
    try {
      setLoading(true);
      await api.solicitudesAdmision.registrarEntrevista(solicitud.id, {
        realizada,
      });
      toast.success(
        realizada
          ? "Entrevista marcada como realizada"
          : "Se habilitó la reprogramación",
      );
      onUpdated();
      if (!realizada) {
        setScheduleOpen(true);
      } else {
        reset();
      }
    } catch (error: any) {
      toast.error(error?.message ?? "No se pudo actualizar la entrevista");
    } finally {
      setLoading(false);
      setPromptInterviewOpen(false);
    }
  };

  const handleDecision = async (aceptar: boolean, mensaje: string) => {
    try {
      setLoading(true);
      await api.solicitudesAdmision.decidir(solicitud.id, {
        aceptar,
        mensaje: mensaje || undefined,
      });
      toast.success(aceptar ? "Solicitud aceptada" : "Solicitud rechazada");
      onUpdated();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message ?? "No se pudo registrar la decisión");
    } finally {
      setLoading(false);
      reset();
    }
  };

  const familiaAccionPendiente = estado === ESTADOS.PROPUESTA && propuestas.length > 0;
  const puedeConfirmar = familiaAccionPendiente;
  const mostrarAccionesEntrevista = estado === ESTADOS.PROGRAMADA;
  const puedeDecidir = estado === ESTADOS.ENTREVISTA_REALIZADA;
  const puedeRechazar = estado === ESTADOS.PENDIENTE || estado === ESTADOS.PROPUESTA || estado === ESTADOS.PROGRAMADA;
  const puedeProgramar = estado === ESTADOS.PENDIENTE || estado === ESTADOS.PROPUESTA;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Solicitud #{solicitud.id} — {solicitud.aspirante?.nombre} {solicitud.aspirante?.apellido}
            </DialogTitle>
          </DialogHeader>

          <section className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Datos del aspirante</h4>
                <p className="text-sm text-muted-foreground">
                  Curso solicitado: {formatCurso(solicitud.aspirante?.cursoSolicitado)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Disponibilidad: {availabilityLabel(solicitud)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Estado actual: {estadoBadge(solicitud.estado)}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Contacto</h4>
                <p className="text-sm flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {solicitud.aspirante?.emailContacto ?? solicitud.aspirante?.email ?? "—"}
                </p>
                <p className="text-sm flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {solicitud.aspirante?.telefono ?? "—"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Entrevista</h4>
                <p className="text-sm text-muted-foreground">
                  Fechas propuestas: {propuestas.length ? propuestas.map(formatDate).join(", ") : "—"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Fecha confirmada: {formatDate(fechaConfirmada)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Respuesta límite: {formatDate(solicitud.fechaLimiteRespuesta)}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Documentación</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {solicitud.documentosRequeridos || "Sin documentación indicada"}
                </p>
                {solicitud.adjuntosInformativos && solicitud.adjuntosInformativos.length > 0 && (
                  <ul className="text-sm text-blue-600 underline space-y-1">
                    {solicitud.adjuntosInformativos.map((url) => (
                      <li key={url}>
                        <a href={url} target="_blank" rel="noreferrer" className="break-all">
                          {url}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {solicitud.notasDireccion && (
              <div>
                <h4 className="font-semibold mb-2">Notas de Dirección</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {solicitud.notasDireccion}
                </p>
              </div>
            )}

            {solicitud.motivoRechazo && estado === ESTADOS.RECHAZADA && (
              <div>
                <h4 className="font-semibold mb-2">Motivo de rechazo</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {solicitud.motivoRechazo}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              {puedeRechazar && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    setRejectOpen(true);
                    setScheduleOpen(false);
                    setConfirmDateOpen(false);
                  }}
                >
                  Rechazar
                </Button>
              )}
              {puedeProgramar && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setScheduleOpen(true);
                    setConfirmDateOpen(false);
                    setRejectOpen(false);
                  }}
                >
                  Programar cita
                </Button>
              )}
              {puedeConfirmar && (
                <Button variant="outline" onClick={() => setConfirmDateOpen(true)}>
                  Registrar fecha confirmada
                </Button>
              )}
              {puedeDecidir && (
                <div className="flex gap-2">
                  <Button onClick={() => setDecisionOpen("aceptar")}>Aceptar</Button>
                  <Button variant="destructive" onClick={() => setDecisionOpen("rechazar")}>
                    Rechazar
                  </Button>
                </div>
              )}
            </div>
          </section>
        </DialogContent>
      </Dialog>

      <RejectModal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        loading={loading}
        onSubmit={handleRechazo}
      />

      <ScheduleModal
        open={scheduleOpen}
        onOpenChange={(open) => {
          setScheduleOpen(open);
          if (!open) setPromptInterviewOpen(false);
        }}
        loading={loading}
        solicitud={solicitud}
        onSubmit={handleProgramar}
      />

      <ConfirmDateModal
        open={confirmDateOpen}
        onOpenChange={setConfirmDateOpen}
        fechas={propuestas}
        loading={loading}
        onSubmit={handleConfirmarFecha}
      />

      <DecisionModal
        open={decisionOpen !== null}
        onOpenChange={(open) => !open && setDecisionOpen(null)}
        aceptar={decisionOpen === "aceptar"}
        loading={loading}
        onSubmit={handleDecision}
      />

      <AlertDialog open={promptInterviewOpen} onOpenChange={setPromptInterviewOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Se realizó la entrevista?</AlertDialogTitle>
            <AlertDialogDescription>
              La fecha programada ya pasó. Registrá el resultado para continuar con la solicitud.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                handleResultadoEntrevista(false);
              }}
            >
              No se realizó
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleResultadoEntrevista(true);
              }}
              disabled={loading}
            >
              Sí, se realizó
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

type ScheduleFormState = {
  fechas: string[];
  documentos: string;
  adjuntos: string[];
  cupoDisponible: boolean | null;
  disponibilidad: string;
};

function ScheduleModal({
  open,
  onOpenChange,
  loading,
  onSubmit,
  solicitud,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  onSubmit: (values: ScheduleFormState) => void;
  solicitud: DTO.SolicitudAdmisionDTO;
}) {
  const [fechas, setFechas] = useState<string[]>(["", "", ""]);
  const [documentos, setDocumentos] = useState(solicitud.documentosRequeridos ?? "");
  const [adjuntos, setAdjuntos] = useState<string[]>(solicitud.adjuntosInformativos ?? []);
  const [cupo, setCupo] = useState<boolean | null>(solicitud.cupoDisponible ?? null);
  const [disponibilidad, setDisponibilidad] = useState<string>(
    solicitud.disponibilidadCurso ?? "",
  );

  useEffect(() => {
    if (open) {
      setFechas([
        solicitud.fechasPropuestas?.[0] ?? "",
        solicitud.fechasPropuestas?.[1] ?? "",
        solicitud.fechasPropuestas?.[2] ?? "",
      ]);
    } else {
      setFechas(["", "", ""]);
    }
    setDocumentos(solicitud.documentosRequeridos ?? "");
    setAdjuntos(solicitud.adjuntosInformativos ?? []);
    setCupo(solicitud.cupoDisponible ?? null);
    setDisponibilidad(solicitud.disponibilidadCurso ?? "");
  }, [open, solicitud]);

  const handleAdjuntosChange = (value: string) => {
    const lines = value
      .split(/\n|;/)
      .map((line) => line.trim())
      .filter(Boolean);
    setAdjuntos(lines);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Programar entrevista</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {fechas.map((value, idx) => (
              <div key={idx} className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Fecha {idx + 1}
                </label>
                <Input
                  type="date"
                  value={value}
                  onChange={(e) => {
                    const next = [...fechas];
                    next[idx] = e.target.value;
                    setFechas(next);
                  }}
                />
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Documentación requerida
            </label>
            <Textarea
              value={documentos}
              onChange={(e) => setDocumentos(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Links/archivos PDF (uno por línea)
            </label>
            <Textarea
              value={adjuntos.join("\n")}
              onChange={(e) => handleAdjuntosChange(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Comentario sobre disponibilidad
            </label>
            <Input
              value={disponibilidad}
              onChange={(e) => setDisponibilidad(e.target.value)}
              placeholder="Disponible, sujeto a vacante, etc."
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="cupo"
              checked={cupo === true}
              onCheckedChange={(checked) => setCupo(checked ? true : false)}
            />
            <label htmlFor="cupo" className="text-sm text-muted-foreground">
              Confirmar que hay cupo disponible
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={() =>
                onSubmit({
                  fechas,
                  documentos,
                  adjuntos,
                  cupoDisponible: cupo,
                  disponibilidad,
                })
              }
              disabled={loading}
            >
              Guardar y notificar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RejectModal({
  open,
  onOpenChange,
  loading,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  onSubmit: (motivo: string) => void;
}) {
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    if (!open) setMotivo("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rechazar solicitud</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Especificá el motivo para que la familia reciba el detalle en el correo.
          </p>
          <Textarea
            placeholder="Motivo del rechazo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => onSubmit(motivo)}
              disabled={loading}
            >
              Rechazar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ConfirmDateModal({
  open,
  onOpenChange,
  fechas,
  loading,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fechas: string[];
  loading: boolean;
  onSubmit: (fecha: string) => void;
}) {
  const [seleccion, setSeleccion] = useState("");

  useEffect(() => {
    if (open) {
      setSeleccion(fechas?.[0] ?? "");
    }
  }, [open, fechas]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar fecha confirmada</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Seleccioná cuál de las fechas propuestas eligió la familia.
          </p>
          <div className="space-y-2">
            {(fechas ?? []).map((f) => (
              <label key={f} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="fecha-confirmada"
                  value={f}
                  checked={seleccion === f}
                  onChange={(e) => setSeleccion(e.target.value)}
                />
                {formatDate(f)}
              </label>
            ))}
            {!fechas.length && (
              <p className="text-sm text-red-500">
                No hay fechas propuestas. Volvé a programar antes de confirmar.
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button
              onClick={() => seleccion && onSubmit(seleccion)}
              disabled={loading || !seleccion}
            >
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DecisionModal({
  open,
  onOpenChange,
  aceptar,
  loading,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aceptar: boolean;
  loading: boolean;
  onSubmit: (aceptar: boolean, mensaje: string) => void;
}) {
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!open) setMensaje("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {aceptar ? "Confirmar aceptación" : "Confirmar rechazo"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {aceptar
              ? "Opcional: agregá un mensaje que recibirán en el correo de aceptación."
              : "Detalle el motivo (opcional) para incluir en el correo de rechazo."}
          </p>
          <Textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => onSubmit(aceptar, mensaje)}
              disabled={loading}
            >
              {aceptar ? "Aceptar" : "Rechazar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
