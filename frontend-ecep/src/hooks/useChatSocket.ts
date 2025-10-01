"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Client, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { ChatMessageDTO } from "@/types/api-generated";
import { useAuth } from "./useAuth";
import { comunicacion } from "@/services/api/modules";
import { BASE as HTTP_BASE } from "@/services/api/http";
import { logger } from "@/lib/logger";

const socketLogger = logger.child({ module: "useChatSocket" });
const debugEnabled = Boolean(process.env.NEXT_PUBLIC_DEBUG);

const debugLog = (
  message: string,
  payload?: Record<string, unknown>,
) => {
  if (!debugEnabled) return;
  if (payload) {
    socketLogger.debug(payload, message);
  } else {
    socketLogger.debug(message);
  }
};

const sanitizeBaseUrl = (value?: string | null) => {
  if (!value) return "";

  return value.trim().replace(/\/+$/, "").replace(/\/api$/i, "");
};

const isLoopbackHostname = (hostname: string): boolean => {
  const normalized = hostname.replace(/\.$/, "").toLowerCase();

  if (normalized === "localhost" || normalized === "::1") return true;

  if (/^127(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}$/.test(normalized)) return true;

  return false;
};

const buildSocketUrl = (endpoint: string, rawToken?: string | null): string => {
  const token = rawToken?.trim();
  if (!token) return endpoint;

  try {
    const url = new URL(endpoint);
    url.searchParams.set("token", token);
    return url.toString();
  } catch (_error) {
    const hashIndex = endpoint.indexOf("#");
    const hasHash = hashIndex >= 0;
    const base = hasHash ? endpoint.slice(0, hashIndex) : endpoint;
    const hash = hasHash ? endpoint.slice(hashIndex) : "";
    const separator = base.includes("?") ? "&" : "?";
    return `${base}${separator}token=${encodeURIComponent(token)}${hash}`;
  }
};

const resolveSocketBase = (): string[] => {
  const candidates = [
    sanitizeBaseUrl(process.env.NEXT_PUBLIC_SOCKET_URL),
    sanitizeBaseUrl(process.env.NEXT_PUBLIC_API_URL),
    sanitizeBaseUrl(HTTP_BASE),
  ].filter(Boolean) as string[];

  if (candidates.length) return candidates;

  if (typeof window !== "undefined") {
    return [
      sanitizeBaseUrl(`${window.location.protocol}//${window.location.host}`),
    ].filter(Boolean) as string[];
  }

  socketLogger.warn(
    "No se pudo resolver la URL base del API; usando cadena vacía.",
  );
  return [];
};

type ResolvedSocketEndpoint = {
  baseUrl: string;
  sockJsUrl: string;
  webSocketUrl: string;
};

const ensureWsPathname = (url: URL) => {
  const rawPath = url.pathname || "/";
  const trimmed = rawPath.replace(/\/+$/, "");
  const segments = trimmed
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.toLowerCase());

  if (segments.includes("ws") || segments.includes("websocket")) {
    url.pathname = trimmed || "/ws";
    return;
  }

  url.pathname = `${trimmed}/ws`;
};

const convertProtocols = (url: URL) => {
  const protocol = url.protocol.toLowerCase();

  let httpProtocol: "http:" | "https:";
  let wsProtocol: "ws:" | "wss:";

  if (protocol === "http:" || protocol === "https:") {
    httpProtocol = protocol;
    wsProtocol = protocol === "https:" ? "wss:" : "ws:";
  } else if (protocol === "ws:" || protocol === "wss:") {
    httpProtocol = protocol === "wss:" ? "https:" : "http:";
    wsProtocol = protocol;
  } else {
    return null;
  }

  const mustEnforceHttps =
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    httpProtocol === "http:" &&
    !isLoopbackHostname(url.hostname);

  if (mustEnforceHttps) {
    httpProtocol = "https:";
    wsProtocol = "wss:";
  }

  const httpUrl = new URL(url.toString());
  const wsUrl = new URL(url.toString());

  httpUrl.protocol = httpProtocol;
  wsUrl.protocol = wsProtocol;

  return { httpUrl, wsUrl };
};

const buildSocketEndpoints = (
  baseValue: string,
  token?: string | null,
): ResolvedSocketEndpoint | null => {
  if (!baseValue) return null;

  const trimmed = baseValue.trim();
  if (!trimmed) return null;

  let parsed: URL | null = null;

  try {
    parsed = new URL(trimmed);
  } catch (_error) {
    if (typeof window !== "undefined") {
      try {
        parsed = new URL(trimmed, window.location.origin);
      } catch (__error) {
        parsed = null;
      }
    }
  }

  if (!parsed) return null;

  ensureWsPathname(parsed);

  const protocols = convertProtocols(parsed);
  if (!protocols) return null;

  const { httpUrl, wsUrl } = protocols;
  const baseUrl = httpUrl.toString();

  return {
    baseUrl,
    sockJsUrl: buildSocketUrl(baseUrl, token),
    webSocketUrl: buildSocketUrl(wsUrl.toString(), token),
  };
};

const getAuthToken = () => {
  if (typeof window === "undefined") return null;

  const fromStorage = localStorage.getItem("token");
  if (fromStorage && fromStorage.trim()) return fromStorage;

  const cookieMatch = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
};

const normalizeMessage = (msg: any): ChatMessageDTO => ({
  id: msg.id,
  emisorId: msg.emisorId ?? msg.emisor ?? 0,
  receptorId: msg.receptorId ?? msg.receptor ?? 0,
  contenido: msg.contenido,
  fechaEnvio: msg.fechaEnvio ?? new Date().toISOString(),
  leido: msg.leido ?? false,
});

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

export default function useChatSocket() {
  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [onlineUsers, setOnlineUsers] = useState<Record<number, boolean>>({});
  const [typingUsers, setTypingUsers] = useState<Record<number, boolean>>({});
  const { user, selectedRole } = useAuth();

  const client = useRef<Client | null>(null);
  const subscriptions = useRef<StompSubscription[]>([]);
  const typingTimeouts = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const connectingRef = useRef(false);

  // 🔹 Conectar WebSocket
  const connect = useCallback(() => {
    if (client.current?.connected || client.current?.active || connectingRef.current)
      return;

    setConnectionStatus("connecting");
    socketLogger.info("🔌 Intentando conectar WebSocket…");

    const token = getAuthToken()?.trim() || null;
    const baseCandidates = resolveSocketBase();

    let endpoints: ResolvedSocketEndpoint | null = null;
    for (const candidate of baseCandidates) {
      endpoints = buildSocketEndpoints(candidate, token);
      if (endpoints) break;
    }

    if (!endpoints && typeof window !== "undefined") {
      const fallback = sanitizeBaseUrl(
        `${window.location.protocol}//${window.location.host}`,
      );
      if (fallback) {
        endpoints = buildSocketEndpoints(fallback, token);
      }
    }

    if (!endpoints) {
      socketLogger.warn("La URL base calculada para el socket es inválida.");
      setConnected(false);
      setConnectionStatus("disconnected");
      return;
    }

    const { baseUrl, sockJsUrl, webSocketUrl } = endpoints;

    let socket: any = null;
    connectingRef.current = true;

    try {
      socket = new SockJS(sockJsUrl, undefined, {
        transports: ["websocket", "xhr-streaming", "xhr-polling"],
        transportOptions: {
          "xhr-streaming": { withCredentials: true },
          "xhr-polling": { withCredentials: true },
        },
        withCredentials: true,
      } as any);
    } catch (error) {
      socketLogger.error(
        { err: error, baseUrl },
        "Error creando la conexión SockJS",
      );

      const NativeWebSocket =
        typeof window !== "undefined" && typeof window.WebSocket === "function"
          ? window.WebSocket
          : typeof globalThis !== "undefined" &&
            typeof (globalThis as any).WebSocket === "function"
          ? ((globalThis as any).WebSocket as typeof WebSocket)
          : undefined;

      if (!NativeWebSocket) {
        socketLogger.warn(
          "WebSocket API no disponible para usar fallback nativo.",
        );
        setConnected(false);
        setConnectionStatus("disconnected");
        connectingRef.current = false;
        return;
      }

      try {
        socket = new NativeWebSocket(webSocketUrl);
        socketLogger.info(
          "SockJS falló; usando WebSocket nativo como fallback.",
        );
      } catch (wsError) {
        socketLogger.error(
          { err: wsError },
          "Error creando la conexión WebSocket nativa",
        );
        setConnected(false);
        setConnectionStatus("disconnected");
        connectingRef.current = false;
        return;
      }
    }

    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 1000,
      debug: (str) => debugLog("STOMP", { frame: str }),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    });

    stompClient.onConnect = (frame) => {
      socketLogger.info({ frame }, "✅ WebSocket conectado");
      socketLogger.info("🛎 Suscribiéndome a /user/queue/messages");
      setConnected(true);
      setConnectionStatus("connected");
      connectingRef.current = false;

      // Suscripción a mensajes
      subscriptions.current.push(
        stompClient.subscribe("/user/queue/messages", (message) => {
          if (!message.body) return;
          const msg = normalizeMessage(JSON.parse(message.body));
          debugLog("📥 Mensaje recibido del backend", { message: msg });

          const senderId = Number(msg.emisorId ?? 0);
          if (senderId) {
            const pendingTimeout = typingTimeouts.current.get(senderId);
            if (pendingTimeout) {
              clearTimeout(pendingTimeout);
              typingTimeouts.current.delete(senderId);
            }
            setTypingUsers((prev) => {
              if (!prev[senderId]) return prev;
              const next = { ...prev };
              delete next[senderId];
              return next;
            });
          }

          setMessages((prev) => {
            // Buscar mensaje optimista para reemplazar
            const idx = prev.findIndex(
              (m) =>
                (m?.id ?? 0) < 0 &&
                m.emisorId === msg.emisorId &&
                m.receptorId === msg.receptorId &&
                m.contenido === msg.contenido,
            );

            if (idx >= 0) {
              // Reemplaza el optimista por el real
              const newMessages = [...prev];
              newMessages[idx] = msg;
              return newMessages;
            }

            // Si no es optimista, agregar normalmente
            return [...prev, msg];
          });
        }),
      );

      // Suscripción a los ACKs del emisor
      subscriptions.current.push(
        stompClient.subscribe("/user/queue/ack", (msg) => {
          if (!msg.body) return;
          debugLog("🔔 ACK recibido", { body: msg.body });
          const ackMessage: ChatMessageDTO = JSON.parse(msg.body);
          // Aquí actualizas tu array de mensajes reemplazando
          // el optimista (id < 0) por el que vino del servidor:
          setMessages((prev) => {
            const idx = prev.findIndex(
              (m) =>
                m.id < 0 &&
                m.receptorId === ackMessage.receptorId &&
                m.contenido === ackMessage.contenido,
            );
            if (idx === -1) return prev;
            const updated = [...prev];
            updated[idx] = ackMessage;
            return updated;
          });
        }),
      );

      subscriptions.current.push(
        stompClient.subscribe("/user/queue/read-receipts", (message) => {
          if (!message.body) return;
          try {
            const payload = JSON.parse(message.body) as {
              readerId?: number | string;
            };
            const readerId = Number(payload?.readerId);
            if (!readerId) return;

            setMessages((prev) =>
              prev.map((msg) =>
                msg.receptorId === readerId && !msg.leido
                  ? { ...msg, leido: true }
                  : msg,
              ),
            );
          } catch (error) {
            if (process.env.NODE_ENV === "development") {
              socketLogger.error({ err: error }, "Error procesando read receipt");
            }
          }
        }),
      );

      subscriptions.current.push(
        stompClient.subscribe("/user/queue/online-status", (message) => {
          if (!message.body) return;
          try {
            const payload = JSON.parse(message.body) as {
              userId?: number | string;
              isOnline?: boolean;
            };
            const targetId = Number(payload?.userId);
            if (!targetId) return;

            setOnlineUsers((prev) => ({
              ...prev,
              [targetId]: Boolean(payload?.isOnline),
            }));
          } catch (error) {
            if (process.env.NODE_ENV === "development") {
              socketLogger.error({ err: error }, "Error procesando estado online");
            }
          }
        }),
      );

      subscriptions.current.push(
        stompClient.subscribe("/user/queue/typing", (message) => {
          if (!message.body) return;
          try {
            const payload = JSON.parse(message.body) as {
              userId?: number | string;
              typing?: boolean;
            };
            const senderId = Number(payload?.userId);
            if (!senderId) return;

            const isTyping = Boolean(payload?.typing);
            if (!isTyping) {
              const timeout = typingTimeouts.current.get(senderId);
              if (timeout) {
                clearTimeout(timeout);
                typingTimeouts.current.delete(senderId);
              }
              setTypingUsers((prev) => {
                if (!prev[senderId]) return prev;
                const next = { ...prev };
                delete next[senderId];
                return next;
              });
              return;
            }

            setTypingUsers((prev) => ({ ...prev, [senderId]: true }));

            const existingTimeout = typingTimeouts.current.get(senderId);
            if (existingTimeout) {
              clearTimeout(existingTimeout);
            }
            const timeout = setTimeout(() => {
              typingTimeouts.current.delete(senderId);
              setTypingUsers((prev) => {
                if (!prev[senderId]) return prev;
                const next = { ...prev };
                delete next[senderId];
                return next;
              });
            }, 4000);
            typingTimeouts.current.set(senderId, timeout);
          } catch (error) {
            if (process.env.NODE_ENV === "development") {
              socketLogger.error({ err: error }, "Error procesando evento typing");
            }
          }
        }),
      );

      // Suscripción a errores
      subscriptions.current.push(
        stompClient.subscribe("/user/queue/errors", (message) => {
          socketLogger.error(
            { body: message.body },
            "⚠️ Error desde el servidor",
          );
        }),
      );
    };

    stompClient.onStompError = (frame) => {
      socketLogger.error({ frame }, "STOMP Error");
      connectingRef.current = false;
    };

    stompClient.onWebSocketError = (event) => {
      socketLogger.error({ event }, "Error en el WebSocket");
      connectingRef.current = false;
    };

    stompClient.onWebSocketClose = () => {
      socketLogger.warn("❌ WebSocket desconectado");
      setConnected(false);
      setConnectionStatus("disconnected");
      connectingRef.current = false;
    };

    stompClient.onDisconnect = () => {
      connectingRef.current = false;
    };

    client.current = stompClient;

    try {
      stompClient.activate();
    } catch (error) {
      socketLogger.error({ err: error }, "No se pudo activar el cliente STOMP");
      connectingRef.current = false;
      setConnected(false);
      setConnectionStatus("disconnected");
    }
  }, []);

  // 🔹 Reconectar manual
  const disconnect = useCallback(() => {
    subscriptions.current.forEach((sub) => sub.unsubscribe());
    subscriptions.current = [];
    const currentClient = client.current;
    if (currentClient) {
      const result = currentClient.deactivate();
      if (result && typeof (result as Promise<void>).catch === "function") {
        (result as Promise<void>).catch((error) =>
        socketLogger.error({ err: error }, "Error al desconectar STOMP"),
        );
      }
    }
    client.current = null;
    setConnected(false);
    setConnectionStatus("disconnected");
    typingTimeouts.current.forEach((timeout) => clearTimeout(timeout));
    typingTimeouts.current.clear();
    setTypingUsers({});
    connectingRef.current = false;
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    connect();
  }, [connect, disconnect]);

  // 🔹 Enviar mensaje

  const sendMessage = (receptorId: number, contenido: string) => {
    if (!client.current || !connected) {
      socketLogger.warn("⚠️ No se pudo enviar, WebSocket no conectado");
      return false;
    }

    // 1) Armar el mensaje optimista
    const optimisticMsg: ChatMessageDTO = {
      id: -Date.now(),
      emisorId: user?.id ?? 0,
      receptorId,
      contenido,
      fechaEnvio: new Date().toISOString(),
      leido: false,
    };

    // 2) Insertarlo inmediatamente en el estado
    setMessages((prev) => [...prev, optimisticMsg]);

    // 3) Publicar por STOMP
    const payload = { receptorId, contenido };
    debugLog("📤 Enviando mensaje", { payload });
    client.current.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(payload),
    });

    return true;
  };

  const sendTyping = useCallback(
    (receptorId: number, typing: boolean) => {
      if (!client.current || !connected) {
        return false;
      }

      const payload = { receptorId, typing };
      client.current.publish({
        destination: "/app/chat.typing",
        body: JSON.stringify(payload),
      });
      return true;
    },
    [connected],
  );

  // 🔹 Marcar mensajes como leídos
  const refreshOnlineStatus = useCallback(async (personaIds: number[]) => {
    const uniqueIds = Array.from(
      new Set(
        (personaIds || [])
          .map((id) => Number(id))
          .filter((id) => Number.isFinite(id) && id > 0),
      ),
    );

    if (uniqueIds.length === 0) return;

    try {
      const { data } = await comunicacion.chat.getOnlineStatus(uniqueIds);
      const entries = Object.entries(data ?? {});
      if (!entries.length) return;

      setOnlineUsers((prev) => {
        const next = { ...prev };
        for (const [key, value] of entries) {
          const id = Number(key);
          if (Number.isFinite(id) && id > 0) {
            next[id] = Boolean(value);
          }
        }
        return next;
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        socketLogger.error({ err: error }, "Error al obtener estado en línea");
      }
    }
  }, []);

  const markRead = useCallback(async (otherUserId: number) => {
    try {
      debugLog("📡 Marcando mensajes como leídos de usuario", {
        otherUserId,
      });
      await comunicacion.chat.markRead(otherUserId);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.emisorId === otherUserId ? { ...msg, leido: true } : msg,
        ),
      );
    } catch (err) {
      socketLogger.error({ err }, "Error al marcar mensajes como leídos");
    }
  }, []);

  // 🔹 Cargar historial desde la API
  const loadHistory = useCallback(async (otherUserId: number) => {
    try {
      debugLog("📡 Cargando historial de usuario", { otherUserId });
      const { data } = await comunicacion.chat.history(otherUserId);
      setMessages(data.map(normalizeMessage));
    } catch (err) {
      socketLogger.error({ err }, "Error al cargar historial");
      setMessages([]); // Evitar que queden mensajes viejos si falla
    }
  }, []);
  // 🔹 Conectar al montar
  useEffect(() => {
    if (!user || !selectedRole) {

      disconnect();
      setMessages([]);
      setOnlineUsers({});
      setTypingUsers({});
      setConnectionStatus("disconnected");
      return;
    }

    connect();
    return () => disconnect();
  }, [connect, disconnect, user?.id, selectedRole]);

  return {
    messages,
    sendMessage,
    connected,
    connectionStatus,
    reconnect,
    markRead,
    loadHistory,
    onlineUsers,
    typingUsers,
    refreshOnlineStatus,
    sendTyping,
  };
}
