"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { admisiones } from "@/services/api/modules";
import type {
  SolicitudAdmisionPortalDTO,
  SolicitudAdmisionPortalSeleccionDTO,
} from "@/types/api-generated";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { format, parseISO } from "date-fns";

const formatDate = (value?: string | null) => {
  if (!value) return "";
  try {
    return format(parseISO(value), "dd/MM/yyyy");
  } catch (err) {
    return value;
  }
};

const buildLabel = (option: NonNullable<SolicitudAdmisionPortalDTO["opciones"]>[number]) => {
  const fecha = option.fecha ? formatDate(option.fecha) : "Fecha a confirmar";
  if (option.horario) {
    return `${fecha} · ${option.horario}`;
  }
  return fecha;
};

export default function EntrevistaPage() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const emailParam = params.get("email");
  const email = emailParam?.trim() || null;

  const [data, setData] = useState<SolicitudAdmisionPortalDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) {
      setError("El enlace es inválido o está incompleto.");
      setData(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { data: response } = await admisiones.portal.detalle(token, email);
      setData(response);
    } catch (err: any) {
      const message =
        err?.response?.status === 404
          ? "No encontramos una solicitud asociada al enlace. Verificá que estés usando la última versión enviada por la escuela."
          : err?.message ?? "No pudimos cargar la información. Intentá nuevamente más tarde.";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [email, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelect = async (opcion: SolicitudAdmisionPortalSeleccionDTO["opcion"]) => {
    if (!token) return;
    try {
      setSubmitting(true);
      const { data: response } = await admisiones.portal.seleccionar(
        token,
        {
          opcion,
        },
        email,
      );
      setData(response);
      setError(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "No pudimos registrar tu respuesta. Intentá nuevamente.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const agradecimiento = useMemo(() => {
    if (!data) return null;
    if (data.reprogramacionSolicitada) {
      return "Registramos que no podés asistir en las fechas propuestas. La dirección se comunicará con nuevas opciones.";
    }
    if (data.fechaSeleccionada) {
      const fecha = formatDate(data.fechaSeleccionada);
      const horario = data.horarioSeleccionado ? ` (${data.horarioSeleccionado})` : "";
      return `Confirmaste tu entrevista para el ${fecha}${horario}. ¡Gracias!`;
    }
    return "¡Gracias por responder!";
  }, [data]);

  const puedeResponder = useMemo(() => {
    if (!data) return false;
    if (data.respuestaRegistrada) return false;
    return (data.opciones?.length ?? 0) > 0;
  }, [data]);

  const correoVisible = email || data?.correoReferencia;

  return (
    <main className="min-h-screen bg-muted/40 py-10">
      <div className="mx-auto w-full max-w-3xl px-4">
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-semibold">
              Confirmá tu entrevista de admisión
            </CardTitle>
            {correoVisible && (
              <p className="text-sm text-muted-foreground">
                Respondiendo como <span className="font-medium">{correoVisible}</span>
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-12 w-1/2" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>No se pudo cargar la solicitud</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : !data ? (
              <p className="text-sm text-muted-foreground">
                Ingresá desde el enlace enviado por la escuela para ver las opciones disponibles.
              </p>
            ) : (
              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Hola {data.aspirante ?? ""}. Elegí la alternativa que mejor se adapte a tu familia.
                  </p>
                  {data.fechaLimiteRespuesta && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Respondé antes del {formatDate(data.fechaLimiteRespuesta)}.
                    </div>
                  )}
                </div>

                {data.respuestaRegistrada && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>¡Gracias por responder!</AlertTitle>
                    <AlertDescription>{agradecimiento}</AlertDescription>
                  </Alert>
                )}

                {puedeResponder && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-semibold uppercase text-muted-foreground">
                      Opciones disponibles
                    </h2>
                    <div className="space-y-3">
                      {(data.opciones ?? []).map((option) => (
                        <Button
                          key={option.indice}
                          variant="outline"
                          size="lg"
                          className="flex w-full items-center justify-between text-left"
                          disabled={submitting}
                          onClick={() => handleSelect(`OPCION_${option.indice}` as const)}
                        >
                          <span className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            {buildLabel(option)}
                          </span>
                          <span className="text-xs text-muted-foreground">Elegir esta opción</span>
                        </Button>
                      ))}
                    </div>
                    {Boolean(data.permiteSolicitarReprogramacion) && (
                      <div className="pt-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-center text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          disabled={submitting}
                          onClick={() => handleSelect("NO_DISPONIBLE")}
                        >
                          No puedo asistir en estas fechas
                        </Button>
                      </div>
                    )}
                    {submitting && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Enviando tu respuesta...
                      </div>
                    )}
                  </div>
                )}

                {data.documentosRequeridos && (
                  <div className="space-y-2">
                    <h2 className="text-sm font-semibold uppercase text-muted-foreground">
                      Documentación para preparar
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {data.documentosRequeridos}
                    </p>
                  </div>
                )}

                {data.adjuntosInformativos && data.adjuntosInformativos.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-sm font-semibold uppercase text-muted-foreground">
                      Material adicional
                    </h2>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {data.adjuntosInformativos.map((link) => (
                        <li key={link}>
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline"
                          >
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {data.aclaracionesDireccion && (
                  <div className="space-y-2">
                    <h2 className="text-sm font-semibold uppercase text-muted-foreground">
                      Notas de la dirección
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {data.aclaracionesDireccion}
                    </p>
                  </div>
                )}

                {data.respuestaRegistrada && !puedeResponder && !submitting && (
                  <Separator />
                )}

                {data.respuestaRegistrada && !puedeResponder && (
                  <p className="text-sm text-muted-foreground">
                    Si necesitás modificar tu respuesta, comunicate con la escuela para coordinarlo.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
