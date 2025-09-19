import { useState, useEffect, useRef, useCallback } from "react";
import { Client, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { ChatMessageDTO } from "@/types/api-generated";
import { useAuth } from "./useAuth";
import { api } from "@/services/api";

const getApiBase = () => {
  // Lee la env (inyectada en build) y quita trailing slashes
  const fromEnv = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
  if (fromEnv) return fromEnv;

  // Fallback: mismo origen del frontend (por si usás reverse proxy)
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.host}`;
  }

  // Si llega acá, no hay base. Mejor avisar en consola.
  console.warn(
    "[useChatSocket] NEXT_PUBLIC_API_URL vacío. Usando fallback vacío.",
  );
  return "";
};

const API_BASE = getApiBase();

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
  const { user } = useAuth();

  const client = useRef<Client | null>(null);
  const subscriptions = useRef<StompSubscription[]>([]);
  const typingTimeouts = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  // 🔹 Conectar WebSocket
  const connect = useCallback(() => {
    if (client.current?.connected) return;

    setConnectionStatus("connecting");
    console.log("🔌 Intentando conectar WebSocket...");

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const socketUrl =
      token && token.trim()
        ? `${API_BASE}/ws?token=${encodeURIComponent(token)}`
        : `${API_BASE}/ws`;

    const socket = new SockJS(socketUrl, undefined, {
      transports: ["websocket", "xhr-streaming", "xhr-polling"],
      transportOptions: {
        "xhr-streaming": { withCredentials: true },
        "xhr-polling": { withCredentials: true },
      },
      withCredentials: true,
    } as any);

    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 1000,
      debug: (str) => console.log("STOMP:", str),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    });

    stompClient.onConnect = (frame) => {
      console.log("✅ WebSocket conectado. Frame:", frame);
      console.log("🛎 Suscribiéndome a /user/queue/messages");
      setConnected(true);
      setConnectionStatus("connected");

      // Suscripción a mensajes
      subscriptions.current.push(
        stompClient.subscribe("/user/queue/messages", (message) => {
          if (!message.body) return;
          const msg = normalizeMessage(JSON.parse(message.body));
          console.log("📥 Mensaje recibido del backend:", msg);

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
          console.log("🔔 ACK recibido:", msg.body);
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
              console.error("Error procesando read receipt", error);
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
              console.error("Error procesando estado online", error);
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
              console.error("Error procesando evento typing", error);
            }
          }
        }),
      );

      // Suscripción a errores
      subscriptions.current.push(
        stompClient.subscribe("/user/queue/errors", (message) => {
          console.error("⚠️ Error desde el servidor:", message.body);
        }),
      );
    };

    stompClient.onStompError = (frame) => {
      console.error("STOMP Error:", frame);
    };

    stompClient.onWebSocketClose = () => {
      console.warn("❌ WebSocket desconectado");
      setConnected(false);
      setConnectionStatus("disconnected");
    };

    stompClient.activate();
    client.current = stompClient;
  }, []);

  // 🔹 Reconectar manual
  const disconnect = useCallback(() => {
    subscriptions.current.forEach((sub) => sub.unsubscribe());
    subscriptions.current = [];
    client.current?.deactivate();
    client.current = null;
    setConnected(false);
    setConnectionStatus("disconnected");
    typingTimeouts.current.forEach((timeout) => clearTimeout(timeout));
    typingTimeouts.current.clear();
    setTypingUsers({});
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    connect();
  }, [connect, disconnect]);

  // 🔹 Enviar mensaje

  const sendMessage = (receptorId: number, contenido: string) => {
    if (!client.current || !connected) {
      console.warn("⚠️ No se pudo enviar, WebSocket no conectado");
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
    console.log("📤 Enviando mensaje:", payload);
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
      const { data } = await api.chat.getOnlineStatus(uniqueIds);
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
        console.error("Error al obtener estado en línea", error);
      }
    }
  }, []);

  const markRead = useCallback(async (otherUserId: number) => {
    try {
      console.log("📡 Marcando mensajes como leídos de usuario:", otherUserId);
      await api.chat.markRead(otherUserId);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.emisorId === otherUserId ? { ...msg, leido: true } : msg,
        ),
      );
    } catch (err) {
      console.error("Error al marcar mensajes como leídos:", err);
    }
  }, []);

  // 🔹 Cargar historial desde la API
  const loadHistory = useCallback(async (otherUserId: number) => {
    try {
      console.log("📡 Cargando historial de usuario:", otherUserId);
      const { data } = await api.chat.history(otherUserId);
      setMessages(data.map(normalizeMessage));
    } catch (err) {
      console.error("Error al cargar historial:", err);
      setMessages([]); // Evitar que queden mensajes viejos si falla
    }
  }, []);
  // 🔹 Conectar al montar
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

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
