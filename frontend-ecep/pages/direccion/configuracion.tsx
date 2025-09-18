import Head from 'next/head';
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface PeriodoEscolar {
  id: number;
  anio: number;
  cerrado: boolean;
}

interface Trimestre {
  id: number;
  periodoEscolarId: number;
  orden: number;
  inicio: string;
  fin: string;
  cerrado: boolean;
}

interface DireccionConfiguracion {
  periodoActual: PeriodoEscolar | null;
  trimestres: Trimestre[];
}

type StatusMessage = {
  type: 'success' | 'error';
  text: string;
};

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');

async function request<T>(path: string, options?: RequestInit, parseJson = true): Promise<T> {
  const normalizedPath = path.startsWith('http')
    ? path
    : `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers(options?.headers ?? undefined);
  if (options?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(normalizedPath, {
    ...options,
    headers,
  });
  const rawBody = await response.text();
  if (!response.ok) {
    let message = `Error ${response.status}`;
    if (rawBody) {
      try {
        const parsed = JSON.parse(rawBody);
        const candidate = parsed?.message ?? parsed?.error ?? parsed?.detail;
        if (typeof candidate === 'string' && candidate.trim().length > 0) {
          message = candidate;
        }
      } catch {
        message = rawBody;
      }
    }
    throw new Error(message);
  }

  if (!parseJson || response.status === 204) {
    return undefined as T;
  }

  if (!rawBody) {
    return undefined as T;
  }

  try {
    return JSON.parse(rawBody) as T;
  } catch {
    return rawBody as unknown as T;
  }
}

type TrimestreFormValues = Pick<Trimestre, 'inicio' | 'fin'>;

type TrimestreActionState = {
  id: number;
  accion: 'cerrar' | 'reabrir';
};

export default function ConfiguracionDireccionPage() {
  const [periodos, setPeriodos] = useState<PeriodoEscolar[]>([]);
  const [configuracion, setConfiguracion] = useState<DireccionConfiguracion | null>(null);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<number | null>(null);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [cargandoConfiguracion, setCargandoConfiguracion] = useState(false);
  const [mensaje, setMensaje] = useState<StatusMessage | null>(null);
  const [nuevoAnio, setNuevoAnio] = useState('');
  const [creandoPeriodo, setCreandoPeriodo] = useState(false);
  const [accionPeriodo, setAccionPeriodo] = useState<'cerrar' | 'reabrir' | null>(null);
  const [guardandoTrimestreId, setGuardandoTrimestreId] = useState<number | null>(null);
  const [accionTrimestre, setAccionTrimestre] = useState<TrimestreActionState | null>(null);

  const cargarConfiguracionParaPeriodo = useCallback(async (id: number) => {
    setCargandoConfiguracion(true);
    try {
      const data = await request<DireccionConfiguracion>(
        `/api/direccion/configuracion/periodos/${id}`,
      );
      setConfiguracion(data);
    } catch (error) {
      const detalle = error instanceof Error ? error.message : 'No se pudo cargar el período seleccionado.';
      setMensaje({ type: 'error', text: detalle });
    } finally {
      setCargandoConfiguracion(false);
    }
  }, []);

  const cargarDatosIniciales = useCallback(async () => {
    setCargandoInicial(true);
    try {
      const [configActual, periodosDisponibles] = await Promise.all([
        request<DireccionConfiguracion>('/api/direccion/configuracion'),
        request<PeriodoEscolar[]>('/api/direccion/configuracion/periodos'),
      ]);
      setPeriodos(periodosDisponibles);

      if (configActual.periodoActual) {
        setConfiguracion(configActual);
        setPeriodoSeleccionado(configActual.periodoActual.id);
      } else if (periodosDisponibles.length > 0) {
        const ultimo = periodosDisponibles[periodosDisponibles.length - 1];
        setPeriodoSeleccionado(ultimo.id);
        await cargarConfiguracionParaPeriodo(ultimo.id);
      } else {
        setConfiguracion({ periodoActual: null, trimestres: [] });
        setPeriodoSeleccionado(null);
      }
    } catch (error) {
      const detalle = error instanceof Error ? error.message : 'No se pudo cargar la configuración.';
      setMensaje({ type: 'error', text: detalle });
    } finally {
      setCargandoInicial(false);
    }
  }, [cargarConfiguracionParaPeriodo]);

  useEffect(() => {
    cargarDatosIniciales();
  }, [cargarDatosIniciales]);

  useEffect(() => {
    if (mensaje) {
      const timeout = setTimeout(() => {
        setMensaje(null);
      }, 5000);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [mensaje]);

  const periodoVisualizado = useMemo(() => {
    if (configuracion?.periodoActual) {
      return configuracion.periodoActual;
    }
    return periodos.find((p) => p.id === periodoSeleccionado) ?? null;
  }, [configuracion, periodos, periodoSeleccionado]);

  const manejarSeleccionPeriodo = async (evento: ChangeEvent<HTMLSelectElement>) => {
    const id = Number(evento.target.value);
    if (Number.isNaN(id)) {
      return;
    }
    setPeriodoSeleccionado(id);
    await cargarConfiguracionParaPeriodo(id);
  };

  const manejarActualizacionTrimestre = async (
    trimestreId: number,
    valores: TrimestreFormValues,
  ) => {
    if (!configuracion) {
      return;
    }
    const trimestre = configuracion.trimestres.find((t) => t.id === trimestreId);
    if (!trimestre) {
      return;
    }
    setGuardandoTrimestreId(trimestreId);
    try {
      await request(`/api/direccion/configuracion/trimestres/${trimestreId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...trimestre,
          inicio: valores.inicio,
          fin: valores.fin,
        }),
      }, false);
      setConfiguracion((prev) => {
        if (!prev) {
          return prev;
        }
        return {
          ...prev,
          trimestres: prev.trimestres.map((t) =>
            t.id === trimestreId
              ? {
                  ...t,
                  inicio: valores.inicio,
                  fin: valores.fin,
                }
              : t,
          ),
        };
      });
      setMensaje({ type: 'success', text: `Fechas del trimestre ${trimestre.orden} actualizadas.` });
    } catch (error) {
      const detalle = error instanceof Error ? error.message : 'No se pudieron actualizar las fechas.';
      setMensaje({ type: 'error', text: detalle });
    } finally {
      setGuardandoTrimestreId(null);
    }
  };

  const manejarAccionTrimestre = async (trimestre: Trimestre, cerrar: boolean) => {
    setAccionTrimestre({ id: trimestre.id, accion: cerrar ? 'cerrar' : 'reabrir' });
    try {
      await request(
        `/api/direccion/configuracion/trimestres/${trimestre.id}/${cerrar ? 'cerrar' : 'reabrir'}`,
        { method: 'POST' },
        false,
      );
      setConfiguracion((prev) => {
        if (!prev) {
          return prev;
        }
        return {
          ...prev,
          trimestres: prev.trimestres.map((t) =>
            t.id === trimestre.id
              ? {
                  ...t,
                  cerrado: cerrar,
                }
              : t,
          ),
        };
      });
      setMensaje({
        type: 'success',
        text: cerrar
          ? `Trimestre ${trimestre.orden} cerrado correctamente.`
          : `Trimestre ${trimestre.orden} reabierto correctamente.`,
      });
    } catch (error) {
      const detalle = error instanceof Error ? error.message : 'No se pudo actualizar el estado del trimestre.';
      setMensaje({ type: 'error', text: detalle });
    } finally {
      setAccionTrimestre(null);
    }
  };

  const manejarAccionPeriodo = async (cerrar: boolean) => {
    if (!periodoVisualizado) {
      return;
    }
    setAccionPeriodo(cerrar ? 'cerrar' : 'reabrir');
    try {
      await request(
        `/api/direccion/configuracion/periodos/${periodoVisualizado.id}/${cerrar ? 'cerrar' : 'reabrir'}`,
        { method: 'POST' },
        false,
      );
      setConfiguracion((prev) => {
        if (!prev?.periodoActual) {
          return prev;
        }
        return {
          ...prev,
          periodoActual: {
            ...prev.periodoActual,
            cerrado: cerrar,
          },
        };
      });
      setPeriodos((prev) =>
        prev.map((p) => (p.id === periodoVisualizado.id ? { ...p, cerrado: cerrar } : p)),
      );
      setMensaje({
        type: 'success',
        text: cerrar
          ? `Período ${periodoVisualizado.anio} cerrado correctamente.`
          : `Período ${periodoVisualizado.anio} reabierto correctamente.`,
      });
    } catch (error) {
      const detalle = error instanceof Error ? error.message : 'No se pudo actualizar el período.';
      setMensaje({ type: 'error', text: detalle });
    } finally {
      setAccionPeriodo(null);
    }
  };

  const manejarCreacionPeriodo = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const anioLimpio = nuevoAnio.trim();
    const anioNumero = Number(anioLimpio);
    if (!anioLimpio || Number.isNaN(anioNumero)) {
      setMensaje({ type: 'error', text: 'Ingresa un año válido para crear el período.' });
      return;
    }
    setCreandoPeriodo(true);
    try {
      const nuevoId = await request<number>(
        '/api/direccion/configuracion/periodos',
        {
          method: 'POST',
          body: JSON.stringify({ anio: anioNumero }),
        },
      );
      const periodosActualizados = await request<PeriodoEscolar[]>(
        '/api/direccion/configuracion/periodos',
      );
      setPeriodos(periodosActualizados);
      setPeriodoSeleccionado(nuevoId);
      const configuracionNueva = await request<DireccionConfiguracion>(
        `/api/direccion/configuracion/periodos/${nuevoId}`,
      );
      setConfiguracion(configuracionNueva);
      setNuevoAnio('');
      setMensaje({
        type: 'success',
        text: `Período ${anioNumero} creado correctamente.`,
      });
    } catch (error) {
      const detalle = error instanceof Error ? error.message : 'No se pudo crear el nuevo período.';
      setMensaje({ type: 'error', text: detalle });
    } finally {
      setCreandoPeriodo(false);
    }
  };

  return (
    <>
      <Head>
        <title>Configuración de dirección</title>
      </Head>
      <main className="container">
        <header className="page-header">
          <h1>Configuración de dirección</h1>
          <p>Gestiona los períodos escolares y las fechas de los trimestres desde un único lugar.</p>
        </header>

        {mensaje && (
          <div className={`alert ${mensaje.type === 'error' ? 'alert-error' : 'alert-success'}`}>
            <span>{mensaje.text}</span>
            <button type="button" className="alert-close" onClick={() => setMensaje(null)}>
              ×
            </button>
          </div>
        )}

        {cargandoInicial ? (
          <section className="card">
            <p>Cargando configuración...</p>
          </section>
        ) : (
          <>
            <section className="card">
              <div className="card-header">
                <div>
                  <h2>Período escolar</h2>
                  <p>Selecciona un período para revisar su estado y administrar cierres.</p>
                </div>
              </div>

              {periodos.length === 0 ? (
                <p className="empty-message">Todavía no se han registrado períodos escolares.</p>
              ) : (
                <>
                  <div className="field-group">
                    <label htmlFor="periodo">Período escolar</label>
                    <select
                      id="periodo"
                      className="select"
                      value={periodoSeleccionado ?? ''}
                      onChange={manejarSeleccionPeriodo}
                      disabled={cargandoConfiguracion}
                    >
                      {periodos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.anio}
                        </option>
                      ))}
                    </select>
                  </div>

                  {cargandoConfiguracion && <p>Cargando información del período...</p>}

                  {periodoVisualizado && !cargandoConfiguracion && (
                    <div className="periodo-resumen">
                      <div className="periodo-detalles">
                        <span className="periodo-anio">{periodoVisualizado.anio}</span>
                        <span
                          className={`estado-badge ${
                            periodoVisualizado.cerrado ? 'estado-cerrado' : 'estado-abierto'
                          }`}
                        >
                          {periodoVisualizado.cerrado ? 'Cerrado' : 'Abierto'}
                        </span>
                      </div>

                      <div className="acciones">
                        <button
                          type="button"
                          className="button button-danger"
                          onClick={() => manejarAccionPeriodo(true)}
                          disabled={
                            periodoVisualizado.cerrado || accionPeriodo === 'cerrar' || cargandoConfiguracion
                          }
                        >
                          {accionPeriodo === 'cerrar' ? 'Cerrando...' : 'Cerrar período'}
                        </button>
                        <button
                          type="button"
                          className="button button-secondary"
                          onClick={() => manejarAccionPeriodo(false)}
                          disabled={
                            !periodoVisualizado.cerrado || accionPeriodo === 'reabrir' || cargandoConfiguracion
                          }
                        >
                          {accionPeriodo === 'reabrir' ? 'Reabriendo...' : 'Reabrir período'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>

            <section className="card">
              <div className="card-header">
                <div>
                  <h2>Crear nuevo período</h2>
                  <p>Define un nuevo ciclo escolar una vez que el anterior esté cerrado.</p>
                </div>
              </div>
              <form className="form-inline" onSubmit={manejarCreacionPeriodo}>
                <div className="field-group">
                  <label htmlFor="anio">Año</label>
                  <input
                    id="anio"
                    type="number"
                    min={2000}
                    className="input"
                    value={nuevoAnio}
                    onChange={(evento) => setNuevoAnio(evento.target.value)}
                    placeholder="2025"
                  />
                </div>
                <button type="submit" className="button" disabled={creandoPeriodo}>
                  {creandoPeriodo ? 'Creando...' : 'Crear período'}
                </button>
              </form>
            </section>

            <section className="card">
              <div className="card-header">
                <div>
                  <h2>Trimestres del período</h2>
                  <p>Actualiza las fechas y el estado de cada trimestre del período seleccionado.</p>
                </div>
              </div>
              {periodoVisualizado ? (
                configuracion && configuracion.trimestres.length > 0 ? (
                  <div className="trimestres-grid">
                    {configuracion.trimestres.map((trimestre) => (
                      <TrimestreCard
                        key={trimestre.id}
                        trimestre={trimestre}
                        onActualizar={manejarActualizacionTrimestre}
                        onToggleCerrado={manejarAccionTrimestre}
                        guardando={guardandoTrimestreId === trimestre.id}
                        accionActual={
                          accionTrimestre && accionTrimestre.id === trimestre.id ? accionTrimestre.accion : null
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <p className="empty-message">
                    No hay trimestres configurados para este período.
                  </p>
                )
              ) : (
                <p className="empty-message">Selecciona un período para ver sus trimestres.</p>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}

type TrimestreCardProps = {
  trimestre: Trimestre;
  onActualizar: (trimestreId: number, valores: TrimestreFormValues) => Promise<void>;
  onToggleCerrado: (trimestre: Trimestre, cerrar: boolean) => Promise<void>;
  guardando: boolean;
  accionActual: 'cerrar' | 'reabrir' | null;
};

function TrimestreCard({
  trimestre,
  onActualizar,
  onToggleCerrado,
  guardando,
  accionActual,
}: TrimestreCardProps) {
  const [inicio, setInicio] = useState(trimestre.inicio);
  const [fin, setFin] = useState(trimestre.fin);

  useEffect(() => {
    setInicio(trimestre.inicio);
  }, [trimestre.inicio]);

  useEffect(() => {
    setFin(trimestre.fin);
  }, [trimestre.fin]);

  const enProceso = accionActual !== null;

  const manejarEnvio = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (!inicio || !fin) {
      return;
    }
    await onActualizar(trimestre.id, { inicio, fin });
  };

  return (
    <form className="trimestre-card" onSubmit={manejarEnvio}>
      <header className="trimestre-header">
        <h3>Trimestre {trimestre.orden}</h3>
        <span className={`estado-badge ${trimestre.cerrado ? 'estado-cerrado' : 'estado-abierto'}`}>
          {trimestre.cerrado ? 'Cerrado' : 'Abierto'}
        </span>
      </header>

      <div className="field-group">
        <label htmlFor={`inicio-${trimestre.id}`}>Fecha de inicio</label>
        <input
          id={`inicio-${trimestre.id}`}
          type="date"
          className="input"
          value={inicio}
          onChange={(evento) => setInicio(evento.target.value)}
          required
        />
      </div>

      <div className="field-group">
        <label htmlFor={`fin-${trimestre.id}`}>Fecha de cierre</label>
        <input
          id={`fin-${trimestre.id}`}
          type="date"
          className="input"
          value={fin}
          onChange={(evento) => setFin(evento.target.value)}
          required
        />
      </div>

      <div className="acciones-trimestre">
        <button type="submit" className="button" disabled={guardando || enProceso}>
          {guardando ? 'Guardando...' : 'Guardar fechas'}
        </button>
        <button
          type="button"
          className="button button-secondary"
          onClick={() => onToggleCerrado(trimestre, !trimestre.cerrado)}
          disabled={guardando || enProceso}
        >
          {accionActual === 'cerrar'
            ? 'Cerrando...'
            : accionActual === 'reabrir'
            ? 'Reabriendo...'
            : trimestre.cerrado
            ? 'Reabrir trimestre'
            : 'Cerrar trimestre'}
        </button>
      </div>
    </form>
  );
}
