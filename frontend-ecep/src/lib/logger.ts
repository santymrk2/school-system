export type LogBindings = Record<string, unknown>;

export interface AppLogger {
  fatal: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  trace: (...args: unknown[]) => void;
  child: (bindings: LogBindings) => AppLogger;
}

const isBrowser = typeof window !== "undefined";

const globalConsole: Console | undefined =
  typeof globalThis !== "undefined" ? globalThis.console : undefined;

type ConsoleMethod = "debug" | "info" | "warn" | "error" | "log";

const consoleMethods: Record<ConsoleMethod, (...args: unknown[]) => void> = {
  debug: globalConsole?.debug
    ? globalConsole.debug.bind(globalConsole)
    : globalConsole?.log
    ? globalConsole.log.bind(globalConsole)
    : () => undefined,
  info: globalConsole?.info
    ? globalConsole.info.bind(globalConsole)
    : globalConsole?.log
    ? globalConsole.log.bind(globalConsole)
    : () => undefined,
  warn: globalConsole?.warn
    ? globalConsole.warn.bind(globalConsole)
    : globalConsole?.log
    ? globalConsole.log.bind(globalConsole)
    : () => undefined,
  error: globalConsole?.error
    ? globalConsole.error.bind(globalConsole)
    : globalConsole?.log
    ? globalConsole.log.bind(globalConsole)
    : () => undefined,
  log: globalConsole?.log
    ? globalConsole.log.bind(globalConsole)
    : () => undefined,
};

const defaultLevel =
  process.env.NEXT_PUBLIC_LOG_LEVEL ??
  (process.env.NODE_ENV === "development" ? "debug" : "info");

const createConsoleLogger = (
  bindings: LogBindings = {},
): AppLogger => {
  const prefixParts = Object.entries(bindings).map(
    ([key, value]) => `${key}=${String(value)}`,
  );
  const prefix = prefixParts.length ? `[${prefixParts.join(" ")}]` : "";

  const call = (method: "debug" | "info" | "warn" | "error", args: unknown[]) => {
    const fn = consoleMethods[method] ?? consoleMethods.log;
    if (prefix) {
      fn(prefix, ...args);
    } else {
      fn(...args);
    }
  };

  return {
    fatal: (...args: unknown[]) => call("error", args),
    error: (...args: unknown[]) => call("error", args),
    warn: (...args: unknown[]) => call("warn", args),
    info: (...args: unknown[]) => call("info", args),
    debug: (...args: unknown[]) => call("debug", args),
    trace: (...args: unknown[]) => call("debug", args),
    child: (childBindings: LogBindings) =>
      createConsoleLogger({ ...bindings, ...childBindings }),
  };
};

type PinoModule = typeof import("pino");

const loadPino = (): PinoModule | null => {
  try {
    // eslint-disable-next-line no-new-func
    const loader = Function(
      "try { return typeof require === 'function' ? require('pino') : null; } catch (error) { return null; }",
    ) as () => PinoModule | null;
    return loader();
  } catch (_error) {
    return null;
  }
};

const buildOptions = () => ({
  level: defaultLevel,
  base: {
    service: "frontend-ecep",
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT ?? process.env.NODE_ENV,
  },
  ...(isBrowser
    ? {
        browser: {
          asObject: true,
        },
      }
    : {}),
});

const factory = loadPino();

const resolveVectorTransport = () => {
  if (!factory || isBrowser || typeof factory.transport !== "function") {
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const path = require("node:path") as typeof import("node:path");

    const transportPath = path.resolve(
      process.cwd(),
      "src/lib/vector-transport.cjs",
    );

    return factory.transport({
      targets: [
        {
          target: transportPath,
          level: defaultLevel,
          options: {
            endpoint:
              process.env.VECTOR_HTTP_ENDPOINT ??
              "http://localhost:9000/logs",
            headers: {
              "content-type": "application/json",
            },
          },
        },
      ],
    });
  } catch (error) {
    consoleMethods.warn?.("Vector transport unavailable", error);
    return null;
  }
};

const vectorTransport = resolveVectorTransport();

let baseLogger: AppLogger;

if (!factory) {
  baseLogger = createConsoleLogger();
} else if (isBrowser) {
  baseLogger = factory(buildOptions());
} else if (vectorTransport) {
  baseLogger = factory(buildOptions(), vectorTransport);
} else {
  baseLogger = createConsoleLogger();
}

export const logger: AppLogger = baseLogger;

export const createLogger = (bindings?: LogBindings): AppLogger =>
  bindings ? logger.child(bindings) : logger;

const attachLoggerToConsole = () => {
  if (!globalConsole) return;

  const remap: Array<[keyof Console, keyof AppLogger]> = [
    ["log", "info"],
    ["info", "info"],
    ["warn", "warn"],
    ["error", "error"],
    ["debug", "debug"],
  ];

  for (const [consoleMethod, loggerMethod] of remap) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalConsole as any)[consoleMethod] = (...args: unknown[]) => {
        const target = logger[loggerMethod];
        if (typeof target === "function") {
          target(...args);
        }
      };
    } catch (_error) {
      // ignore assignment errors in read-only environments
    }
  }
};

attachLoggerToConsole();
