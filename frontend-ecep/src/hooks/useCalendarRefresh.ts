"use client";

import { useEffect, useMemo, useState } from "react";

import {
  notifyCalendarUpdated,
  subscribeCalendarUpdates,
  type CalendarEventScope,
} from "@/lib/calendar-events";

/**
 * Exposes a monotonically increasing value that changes whenever the
 * calendario escolar se actualiza en el backend.
 *
 * Podés usarlo en efectos que cargan datos de trimestres o períodos para
 * volver a consultar la API cuando Dirección realiza cambios.
 */
export function useCalendarRefresh(
  scope?: CalendarEventScope | CalendarEventScope[],
) {
  const [version, setVersion] = useState(0);

  const scopeKey = useMemo(() => {
    if (!scope) return "";
    const list = Array.isArray(scope) ? scope.slice() : [scope];
    return list.sort().join("|");
  }, [scope]);

  useEffect(() => {
    const expected = scopeKey
      ? (scopeKey.split("|") as CalendarEventScope[])
      : [];
    return subscribeCalendarUpdates((scopes) => {
      if (!expected.length) {
        setVersion((prev) => prev + 1);
        return;
      }
      const shouldUpdate = scopes.some(
        (item) => item === "calendario" || expected.includes(item),
      );
      if (shouldUpdate) {
        setVersion((prev) => prev + 1);
      }
    });
  }, [scopeKey]);

  return version;
}

/**
 * Permite forzar un evento de actualización manual desde componentes que
 * necesitan propagar cambios locales sin esperar a la respuesta del backend.
 */
export function triggerCalendarRefresh(
  ...scopes: CalendarEventScope[]
): void {
  notifyCalendarUpdated(...scopes);
}
