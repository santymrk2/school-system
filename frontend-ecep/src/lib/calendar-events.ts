export type CalendarEventScope = "calendario" | "periodos" | "trimestres";

export type CalendarEventListener = (
  scopes: CalendarEventScope[],
) => void;

const DEFAULT_SCOPE: CalendarEventScope = "calendario";

const listeners = new Set<CalendarEventListener>();

export function subscribeCalendarUpdates(listener: CalendarEventListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyCalendarUpdated(
  ...scopes: CalendarEventScope[]
): void {
  const payload = (scopes.length ? scopes : [DEFAULT_SCOPE]).map((scope) =>
    scope ?? DEFAULT_SCOPE,
  );
  for (const listener of Array.from(listeners)) {
    try {
      listener(payload);
    } catch {
      // ignore individual listener errors to avoid breaking the notification chain
    }
  }
}
