"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type React from "react";
import { DashboardLayout } from "@/app/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Send, ArrowLeft, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { comunicacion, identidad } from "@/services/api/modules";
import { useAuth } from "@/hooks/useAuth";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { ChatMessageDTO, PersonaResumenDTO } from "@/types/api-generated";
import useChatSocket from "@/hooks/useChatSocket";
import { useSearchParams } from "next/navigation";

dayjs.extend(relativeTime);

const getPersonaDisplayName = (
  persona: PersonaResumenDTO | null | undefined,
) => {
  if (!persona) return "Sin nombre";
  if (persona.nombreCompleto && persona.nombreCompleto.trim()) {
    return persona.nombreCompleto;
  }
  const composed = [persona.apellido, persona.nombre]
    .filter((value) => value && value.trim())
    .join(", ");
  if (composed) return composed;
  if (persona.email) return persona.email;
  if (persona.dni) return `DNI ${persona.dni}`;
  return `Persona ${persona.id}`;
};

const getPersonaInitials = (persona: PersonaResumenDTO | null | undefined) => {
  const source =
    persona?.nombreCompleto ||
    [persona?.nombre, persona?.apellido].filter(Boolean).join(" ") ||
    persona?.email ||
    "";
  if (!source) return "?";
  const letters = source
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk.charAt(0).toUpperCase());
  return letters.length ? letters.join("") : source.charAt(0).toUpperCase();
};

const getPersonaEmail = (persona: PersonaResumenDTO | null | undefined) =>
  persona?.email ?? "Sin email";

export default function ChatComponent() {
  const [activeChats, setActiveChats] = useState<PersonaResumenDTO[]>([]);
  const [openChatDialog, setOpenChatDialog] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [personas, setPersonas] = useState<PersonaResumenDTO[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedPersona, setSelectedPersona] =
    useState<PersonaResumenDTO | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingStateRef = useRef<{ targetId: number | null; isTyping: boolean }>(
    {
      targetId: null,
      isTyping: false,
    },
  );
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const {
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
  } = useChatSocket();

  useEffect(() => {
    if (!user) {
      setActiveChats([]);
      setUnreadCounts({});
      return;
    }

    let alive = true;

    const loadData = async () => {
      try {
        const [chatsRes, unreadRes] = await Promise.all([
          comunicacion.chat.getActiveChats(),
          comunicacion.chat.getUnreadCounts(),
        ]);

        if (!alive) return;
        setActiveChats(chatsRes.data ?? []);
        setUnreadCounts(unreadRes.data ?? {});
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error al cargar chats", err);
        }
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000);
    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const query = searchTerm.trim();

    const debounceTimer = setTimeout(() => {
      identidad.personasCore
        .searchCredenciales(query || undefined)
        .then(({ data }) => {
          const results = (data ?? []).filter((p) => p.id !== user.id);
          setPersonas(results);
        })
        .catch((error) => {
          if (process.env.NODE_ENV === "development") {
            console.error("Error al buscar personas", error);
          }
        });
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [user, searchTerm]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!messages.length || !user) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.emisorId === user.id) return;
    if (activeChats.some((chat) => chat.id === lastMessage.emisorId)) return;

    (async () => {
      try {
        const { data } = await identidad.personasCore.getResumen(
          lastMessage.emisorId,
        );
        if (data) {
          setActiveChats((prev) =>
            prev.some((chat) => chat.id === data.id) ? prev : [...prev, data],
          );
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("No pudimos cargar la persona del mensaje", error);
        }
      }
    })();
  }, [messages, user, activeChats]);

  useEffect(() => {
    if (!selectedPersona) return;
    const otherId = selectedPersona.id;
    if (!otherId) return;

    const hasUnread = messages.some(
      (msg) => msg.emisorId === otherId && !msg.leido,
    );

    if (!hasUnread) return;

    let cancelled = false;

    (async () => {
      try {
        await markRead(otherId);
        if (!cancelled) {
          setUnreadCounts((prev) => ({
            ...prev,
            [otherId]: 0,
          }));
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("No se pudo marcar como leído", error);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [messages, selectedPersona, markRead]);

  useEffect(() => {
    return () => {
      if (
        typingStateRef.current.isTyping &&
        typingStateRef.current.targetId != null
      ) {
        sendTyping(typingStateRef.current.targetId, false);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [sendTyping]);

  useEffect(() => {
    if (!selectedPersona) return;
    const refreshed = activeChats.find(
      (chat) => chat.id === selectedPersona.id,
    );
    if (refreshed && refreshed !== selectedPersona) {
      setSelectedPersona(refreshed);
    }
  }, [activeChats, selectedPersona]);

  useEffect(() => {
    if (!activeChats.length) return;
    refreshOnlineStatus(activeChats.map((chat) => chat.id));
  }, [activeChats, refreshOnlineStatus]);

  useEffect(() => {
    const previousTarget = typingStateRef.current.targetId;
    if (
      previousTarget &&
      previousTarget !== selectedUserId &&
      typingStateRef.current.isTyping
    ) {
      sendTyping(previousTarget, false);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    typingStateRef.current = {
      targetId: selectedUserId ?? null,
      isTyping: false,
    };
  }, [selectedUserId, sendTyping]);

  const openChat = useCallback(
    async (persona: PersonaResumenDTO) => {
      setActiveChats((prev) =>
        prev.some((chat) => chat.id === persona.id) ? prev : [...prev, persona],
      );
      setSelectedPersona(persona);
      setSelectedUserId(persona.id);

      await loadHistory(persona.id);
      await markRead(persona.id);

      setUnreadCounts((prev) => ({
        ...prev,
        [persona.id]: 0,
      }));

      refreshOnlineStatus([persona.id]);
      setOpenChatDialog(false);
    },
    [loadHistory, markRead, refreshOnlineStatus],
  );

  useEffect(() => {
    const personaIdParam = searchParams?.get("personaId");
    if (!personaIdParam) return;
    const parsed = Number.parseInt(personaIdParam, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    if (selectedUserId === parsed) return;

    let cancelled = false;

    (async () => {
      try {
        const { data } = await identidad.personasCore.getResumen(parsed);
        if (!data || cancelled) return;
        await openChat(data);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("No se pudo abrir el chat solicitado", error);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, selectedUserId, openChat]);

  const finalizeTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    const { targetId, isTyping } = typingStateRef.current;
    if (isTyping && targetId != null) {
      sendTyping(targetId, false);
    }
    typingStateRef.current = {
      targetId: selectedUserId ?? null,
      isTyping: false,
    };
  };

  const handleTypingActivity = () => {
    if (!connected || selectedUserId == null) return;

    if (
      !typingStateRef.current.isTyping ||
      typingStateRef.current.targetId !== selectedUserId
    ) {
      if (
        typingStateRef.current.isTyping &&
        typingStateRef.current.targetId != null &&
        typingStateRef.current.targetId !== selectedUserId
      ) {
        sendTyping(typingStateRef.current.targetId, false);
      }
      sendTyping(selectedUserId, true);
      typingStateRef.current = {
        targetId: selectedUserId,
        isTyping: true,
      };
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      const { targetId, isTyping } = typingStateRef.current;
      if (isTyping && targetId != null) {
        sendTyping(targetId, false);
      }
      typingStateRef.current = {
        targetId,
        isTyping: false,
      };
      typingTimeoutRef.current = null;
    }, 1500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    handleTypingActivity();
  };

  const handleSend = () => {
    if (!newMessage.trim() || selectedUserId == null) return;
    sendMessage(selectedUserId, newMessage.trim());
    finalizeTyping();
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const ConnectionStatus = () => {
    switch (connectionStatus) {
      case "connecting":
        return (
          <div className="flex items-center gap-2 text-yellow-600">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Conectando...</span>
          </div>
        );
      case "connected":
        return (
          <div className="flex items-center gap-2 text-green-600">
            <Wifi className="h-4 w-4" />
            <span className="text-sm">Conectado</span>
          </div>
        );
      case "disconnected":
        return (
          <div className="flex items-center gap-2 text-red-600">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm">Desconectado</span>
            <Button size="sm" variant="outline" onClick={reconnect}>
              Reconectar
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const MessageBubble = ({ message }: { message: ChatMessageDTO }) => {
    const isOwn = message.emisorId === user?.id;
    const isOptimistic = message.id < 0;

    const filledDotClass = isOwn
      ? "inline-flex h-2 w-2 rounded-full bg-primary-foreground"
      : "inline-flex h-2 w-2 rounded-full bg-primary";
    const outlineDotClass = isOwn
      ? "inline-flex h-2 w-2 rounded-full border border-primary-foreground"
      : "inline-flex h-2 w-2 rounded-full border border-primary";

    let statusContent: JSX.Element | null = null;

    if (isOwn) {
      if (isOptimistic) {
        statusContent = <span className={outlineDotClass} />;
      } else if (message.leido) {
        statusContent = (
          <span className="flex items-center gap-1">
            <span className={filledDotClass} />
            <span className={filledDotClass} />
          </span>
        );
      } else {
        statusContent = <span className={filledDotClass} />;
      }
    }

    return (
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
        <div
          className={`
            max-w-xs lg:max-w-md px-4 py-2 rounded-lg
            ${
              isOwn
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }
            ${isOptimistic ? "opacity-60" : ""}
          `}
        >
          <p className="text-sm">{message.contenido}</p>
          <div className="mt-1 flex items-end justify-between gap-2">
            <span className="text-xs opacity-70">
              {dayjs(message.fechaEnvio).format("HH:mm")}
            </span>
            {statusContent && (
              <span className="ml-2 flex items-center gap-1 opacity-80">
                {statusContent}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
      if (typeof window === "undefined") return;
      const mql = window.matchMedia(query);
      setMatches(mql.matches);
      const handler = () => setMatches(mql.matches);
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }, [query]);
    return matches;
  };

  const isMd = useMediaQuery("(min-width: 768px)");
  const showChatList = !selectedPersona || isMd;
  const showChatView = selectedPersona && (isMd || !showChatList);

  const selectedPersonaId = selectedPersona?.id ?? null;
  const selectedTyping =
    selectedPersonaId != null ? typingUsers[selectedPersonaId] : false;
  const selectedOnline =
    selectedPersonaId != null ? onlineUsers[selectedPersonaId] : undefined;
  const selectedStatus = selectedPersonaId
    ? selectedTyping
      ? "Escribiendo..."
      : selectedOnline
        ? "En línea"
        : "Desconectado"
    : "";

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col p-4 md:p-8 pt-6">
        <div className="flex flex-1 min-h-0 overflow-hidden rounded-xl bg-background">
          {showChatList && (
            <div className="flex w-full min-h-0 flex-col bg-background md:w-1/3 md:flex-none md:border-r md:border-border">
              <div className="px-4 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Chats</h2>
                  <Dialog
                    open={openChatDialog}
                    onOpenChange={setOpenChatDialog}
                  >
                    <DialogTrigger asChild>
                      <Button size="icon">
                        <Plus className="size-6" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nuevo Chat</DialogTitle>
                        <DialogDescription>
                          Buscá y seleccioná una persona para iniciar la
                          conversación.
                        </DialogDescription>
                      </DialogHeader>
                      <Input
                        placeholder="Escribí para buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <ScrollArea className="h-64">
                        <div className="space-y-2">
                          {personas
                            .filter(
                              (p) => !activeChats.some((ac) => ac.id === p.id),
                            )
                            .map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                className="w-full p-2 rounded hover:bg-muted text-left"
                                onClick={() => openChat(p)}
                              >
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                      {getPersonaInitials(p)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-sm">
                                      {getPersonaDisplayName(p)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {getPersonaEmail(p)}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          {personas.length === 0 && (
                            <p className="px-2 text-sm text-muted-foreground">
                              Escribí para buscar personas con acceso al
                              sistema.
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
                <ConnectionStatus />
              </div>
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  {activeChats.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No hay chats activos. Usá el botón "+" para iniciar uno
                      nuevo.
                    </div>
                  ) : (
                    <div className="space-y-1 p-2">
                      {activeChats.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => openChat(p)}
                          className={`
                            flex w-full items-center space-x-3 p-3 rounded-lg transition-colors
                            ${
                              selectedPersona?.id === p.id
                                ? "bg-primary/10 border border-primary/20"
                                : "hover:bg-muted"
                            }
                          `}
                        >
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {getPersonaInitials(p)}
                              </AvatarFallback>
                            </Avatar>
                            {(unreadCounts[p.id] ?? 0) > 0 && (
                              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                {unreadCounts[p.id]}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="font-medium truncate text-sm">
                              {getPersonaDisplayName(p)}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {getPersonaEmail(p)}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}

          {showChatView && selectedPersona && (
            <div className="flex flex-1 min-h-0 flex-col bg-background">
              <div className="p-4 flex items-center gap-3">
                {!isMd && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPersona(null);
                      setSelectedUserId(null);
                    }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {getPersonaInitials(selectedPersona)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">
                    {getPersonaDisplayName(selectedPersona)}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedStatus}
                  </p>
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4">
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>

              <div className="p-4">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribí un mensaje..."
                    disabled={!connected || selectedUserId == null}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={
                      !connected || !newMessage.trim() || selectedUserId == null
                    }
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
