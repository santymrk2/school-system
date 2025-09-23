"use client";

import { useEffect, useMemo, useState } from "react";
import { calendario } from "@/services/api/modules";
import type { PeriodoEscolarDTO, TrimestreDTO } from "@/types/api-generated";
import { getTrimestreEstado } from "@/lib/trimestres";

type UseActivePeriodOpts = {
  today?: string; // YYYY-MM-DD
  preferOpen?: boolean; // prioriza período con trimestres abiertos hoy
  tickMidnight?: boolean; // actualiza hoyISO al cruzar medianoche (default true)
};

function toLocalISODate(d = new Date()): string {
  const tz = d.getTimezoneOffset();
  return new Date(d.getTime() - tz * 60_000).toISOString().slice(0, 10);
}

const norm = {
  start: (t: TrimestreDTO) =>
    ((t as any).fechaInicio ?? (t as any).inicio ?? "1900-01-01") as string,
  end: (t: TrimestreDTO) =>
    ((t as any).fechaFin ?? (t as any).fin ?? "2999-12-31") as string,
  periodoId: (t: TrimestreDTO) =>
    ((t as any).periodoEscolarId ?? (t as any).periodoId) as number | undefined,
  estado: (t: TrimestreDTO) => getTrimestreEstado(t),
};

const inRange = (dateISO: string, fromISO: string, toISO: string) =>
  dateISO >= fromISO && dateISO <= toISO;

export function useActivePeriod(opts?: UseActivePeriodOpts) {
  const [periodos, setPeriodos] = useState<PeriodoEscolarDTO[]>([]);
  const [trimestres, setTrimestres] = useState<TrimestreDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // hoyISO controlado por props (tests) o por reloj local
  const [today, setToday] = useState<string>(opts?.today ?? toLocalISODate());
  const preferOpen = opts?.preferOpen ?? true;
  const tickMidnight = opts?.tickMidnight ?? true;

  // Opcional: actualizar a medianoche si no viene por props
  useEffect(() => {
    if (opts?.today || !tickMidnight) return;
    const id = setInterval(() => {
      const now = toLocalISODate();
      setToday((prev) => (prev !== now ? now : prev));
    }, 60_000); // chequeo cada 1 min (barato y suficiente)
    return () => clearInterval(id);
  }, [opts?.today, tickMidnight]);

  // Si cambian props de test, sincronizamos
  useEffect(() => {
    if (opts?.today) setToday(opts.today);
  }, [opts?.today]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [per, tri] = await Promise.all([
          calendario.periodos.list().then((r) => r.data ?? []),
          calendario.trimestres.list().then((r) => r.data ?? []),
        ]);
        if (!alive) return;
        setPeriodos(per);
        setTrimestres(tri);
      } catch (e: any) {
        if (alive)
          setError(e?.message ?? "No se pudo cargar el calendario escolar");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const computed = useMemo(() => {
    if (!periodos.length || !trimestres.length) {
      return {
        periodo: undefined as PeriodoEscolarDTO | undefined,
        trimestresDelPeriodo: [] as TrimestreDTO[],
        allTriIds: [] as number[],
        activeTriIdsToday: [] as number[],
      };
    }

    const trisByPeriodo = new Map<number, TrimestreDTO[]>();
    for (const t of trimestres) {
      const pid = norm.periodoId(t);
      if (!pid) continue;
      const arr = trisByPeriodo.get(pid) ?? [];
      arr.push(t);
      trisByPeriodo.set(pid, arr);
    }

    let elegido: PeriodoEscolarDTO | undefined;
    if (preferOpen) {
      elegido = periodos.find((p) => {
        const ts = trisByPeriodo.get(p.id) ?? [];
        return ts.some(
          (t) => norm.estado(t) === "activo" && inRange(today, norm.start(t), norm.end(t)),
        );
      });
    }
    if (!elegido) {
      elegido = [...periodos].sort(
        (a: any, b: any) => (b.anio ?? 0) - (a.anio ?? 0),
      )[0];
    }

    const trimestresDelPeriodo = elegido
      ? (trisByPeriodo.get(elegido.id) ?? [])
      : [];
    // ordena por fecha de inicio por prolijidad
    trimestresDelPeriodo.sort((a, b) =>
      norm.start(a) < norm.start(b) ? -1 : 1,
    );

    const allTriIds = trimestresDelPeriodo.map((t) => t.id);
    const activeTriIdsToday = trimestresDelPeriodo
      .filter(
        (t) => norm.estado(t) === "activo" && inRange(today, norm.start(t), norm.end(t)),
      )
      .map((t) => t.id);

    const trimestreActivo = trimestresDelPeriodo.find(
      (t) => norm.estado(t) === "activo",
    );

    return {
      periodo: elegido,
      trimestresDelPeriodo,
      allTriIds,
      activeTriIdsToday,
      trimestreActivo,
    };
  }, [periodos, trimestres, today, preferOpen]);

  const getTrimestreByDate = (dateISO: string) =>
    computed.trimestresDelPeriodo.find((t) =>
      inRange(dateISO, norm.start(t), norm.end(t)),
    );

  const isTrimestreClosed = (trimestreId?: number): boolean | undefined => {
    if (!trimestreId) return undefined;
    const t = computed.trimestresDelPeriodo.find((x) => x.id === trimestreId);
    return t ? norm.estado(t) === "cerrado" : undefined;
  };

  return {
    loading,
    error,
    periodoEscolarId: computed.periodo?.id,
    periodoEscolar: computed.periodo,
    trimestres, // crudo
    trimestresDelPeriodo: computed.trimestresDelPeriodo,
    trimestreActivo: computed.trimestreActivo,
    triIds: computed.allTriIds,
    activeTriIdsToday: computed.activeTriIdsToday,
    hoyISO: today,
    getTrimestreByDate,
    isTrimestreClosed,
  };
}
