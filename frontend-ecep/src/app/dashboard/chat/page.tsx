"use client";

import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/app/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { ChatMessageDTO, PersonaResumenDTO } from "@/types/api-generated";
import useChatSocket from "@/hooks/useChatSocket";

dayjs.extend(relativeTime);

const getPersonaDisplayName = (persona: PersonaResumenDTO | null | undefined) => {
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
  const source = persona?.nombreCompleto ||
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
  const [selectedPersona, setSelectedPersona] = useState<PersonaResumenDTO | null>(
    null,
  );

  const bottomRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const {
    messages,
    sendMessage,
    connected,
    connectionStatus,
    reconnect,
    markRead,
    loadHistory,
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
          api.chat.getActiveChats(),
          api.chat.getUnreadCounts(),
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
      api.personasCore
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
        const { data } = await api.personasCore.getResumen(lastMessage.emisorId);
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
    const refreshed = activeChats.find((chat) => chat.id === selectedPersona.id);
    if (refreshed && refreshed !== selectedPersona) {
      setSelectedPersona(refreshed);
    }
  }, [activeChats, selectedPersona]);

  const openChat = async (persona: PersonaResumenDTO) => {
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

    setOpenChatDialog(false);
  };

  const handleSend = () => {
    if (!newMessage.trim() || selectedUserId == null) return;
    sendMessage(selectedUserId, newMessage.trim());
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
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs opacity-70">
              {dayjs(message.fechaEnvio).format("HH:mm")}
            </span>
            {isOptimistic && <span className="text-xs ml-2">⏳</span>}
            {!isOptimistic && isOwn && (
              <span className="text-xs ml-2">{message.leido ? "✓✓" : "✓"}</span>
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

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Chat</h2>
            <p className="text-muted-foreground">Mensajes privados</p>
          </div>
        </div>
        <div className="flex h-[calc(100vh-12rem)] md:h-[calc(100vh-12rem)]">
          {showChatList && (
            <div className="w-full md:w-1/3 flex-shrink-0">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg">Chats</CardTitle>
                    <Dialog
                      open={openChatDialog}
                      onOpenChange={setOpenChatDialog}
                    >
                      <DialogTrigger asChild>
                        <Button size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Nuevo Chat</DialogTitle>
                          <DialogDescription>
                            Buscá y seleccioná una persona para iniciar la conversación.
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
                              .filter((p) => !activeChats.some((ac) => ac.id === p.id))
                              .map((p) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  className="w-full p-2 rounded hover:bg-muted text-left"
                                  onClick={() => openChat(p)}
                                >
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback>{getPersonaInitials(p)}</AvatarFallback>
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
                                Escribí para buscar personas con acceso al sistema.
                              </p>
                            )}
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <ConnectionStatus />
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <ScrollArea className="h-full">
                    {activeChats.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        No hay chats activos. Usá el botón "+" para iniciar uno nuevo.
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
                                <AvatarFallback>{getPersonaInitials(p)}</AvatarFallback>
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
                </CardContent>
              </Card>
            </div>
          )}

          {showChatView && selectedPersona && (
            <div className="flex-1 flex flex-col bg-background border rounded-lg">
              <div className="p-4 flex items-center gap-3 bg-background rounded-lg">
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
                  <AvatarFallback>{getPersonaInitials(selectedPersona)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">
                    {getPersonaDisplayName(selectedPersona)}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {connected ? "En línea" : "Desconectado"}
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

              <div className="p-4 bg-background rounded-lg">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribí un mensaje..."
                    disabled={!connected || selectedUserId == null}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!connected || !newMessage.trim() || selectedUserId == null}
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
