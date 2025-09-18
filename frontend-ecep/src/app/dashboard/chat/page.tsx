"use client";

import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/app/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import type { ChatMessageDTO, UsuarioBusquedaDTO } from "@/types/api-generated";
import useChatSocket from "@/hooks/useChatSocket";

dayjs.extend(relativeTime);

export default function ChatComponent() {
  const [activeChats, setActiveChats] = useState<UsuarioBusquedaDTO[]>([]);
  const [openChatDialog, setOpenChatDialog] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [personas, setPersonas] = useState<UsuarioBusquedaDTO[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});

  const [selectedUserId, setSelectedUserId] = useState<number>(0);
  const [selectedPersona, setSelectedPersona] =
    useState<UsuarioBusquedaDTO | null>(null);

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

  /* ---------- Cargar chats activos y unreadCounts ---------- */
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const [chatsRes, unreadRes] = await Promise.all([
          api.chat.getActiveChats(),
          api.chat.getUnreadCounts(),
        ]);

        setActiveChats(chatsRes.data);
        setUnreadCounts(unreadRes.data ?? {});
      } catch (err) {
        console.error("Error al cargar chats:", err);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  /* ---------- Búsqueda de personas con debounce ---------- */
  useEffect(() => {
    if (!user) return;
    const debounceTimer = setTimeout(() => {
      api
        .searchUsers(searchTerm.trim())
        .then(({ data }) => setPersonas(data))
        .catch(console.error);
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [user, searchTerm]);

  /* ---------- Scroll automático ---------- */
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  /* ---------- Agregar chat si llega un mensaje nuevo de usuario desconocido ---------- */
  useEffect(() => {
    if (!messages.length) return;
    const lastMessage = messages[messages.length - 1];

    if (
      lastMessage.emisorId !== user?.id &&
      !activeChats.some((chat) => chat.id === lastMessage.emisorId)
    ) {
      // Obtener datos del usuario desde la API
      api.user
        .getById(lastMessage.emisorId)
        .then(({ data }) => {
          const nuevoChat: UsuarioBusquedaDTO = {
            id: data.id,
            nombreCompleto: `${data.nombre} ${data.apellido}`,
            email: data.email,
          };
          setActiveChats((prev) => [...prev, nuevoChat]);
        })
        .catch(console.error);
    }
  }, [messages]);

  /* ---------- Abrir chat y marcar como leído ---------- */
  const openChat = async (p: UsuarioBusquedaDTO) => {
    setSelectedPersona(p);
    setSelectedUserId(p.id);

    await loadHistory(p.id);
    markRead(p.id);

    setUnreadCounts((prev) => ({
      ...prev,
      [p.id]: 0,
    }));

    setOpenChatDialog(false);
  };

  /* ---------- Enviar mensaje ---------- */
  const handleSend = () => {
    if (!newMessage.trim() || !selectedUserId) return;
    sendMessage(selectedUserId, newMessage.trim());
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ---------- Estado conexión ---------- */
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

  /* ---------- Mensaje ---------- */
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

  /* ---------- Responsive ---------- */
  const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
      const m = window.matchMedia(query);
      setMatches(m.matches);
      const handler = () => setMatches(m.matches);
      m.addEventListener("change", handler);
      return () => m.removeEventListener("change", handler);
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
          {/* Lista de chats */}
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
                            Busca y selecciona una persona para iniciar
                            conversación
                          </DialogDescription>
                        </DialogHeader>
                        <Input
                          placeholder="Escribe para buscar..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <ScrollArea className="h-64">
                          <div className="space-y-2">
                            {personas
                              .filter(
                                (p) =>
                                  !activeChats.find((ac) => ac.id === p.id),
                              )
                              .map((p) => (
                                <div
                                  key={p.id}
                                  className="p-2 rounded hover:bg-muted cursor-pointer"
                                  onClick={() => openChat(p)}
                                >
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      {/*
                                      <AvatarImage
                                        src={`/avatars/${p.id}.jpg`}
                                      />
                                      */}
                                      <AvatarFallback>
                                        {p.nombreCompleto?.charAt(0) || "?"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium text-sm">
                                        {p.nombreCompleto}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {p.email}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
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
                        No hay chats activos. Haz clic en + para iniciar uno.
                      </div>
                    ) : (
                      <div className="space-y-1 p-2">
                        {activeChats.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => openChat(p)}
                            className={`
                          flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors
                          ${
                            selectedPersona?.id === p.id
                              ? "bg-primary/10 border border-primary/20"
                              : "hover:bg-muted"
                          }
                        `}
                          >
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                {/*
                                <AvatarImage src={`/avatars/${p.id}.jpg`} />
                                */}
                                <AvatarFallback>
                                  {p.nombreCompleto?.charAt(0) || "?"}
                                </AvatarFallback>
                              </Avatar>
                              {unreadCounts[p.id] > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                  {unreadCounts[p.id]}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate text-sm">
                                {p.nombreCompleto}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {p.email}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Vista del chat */}
          {showChatView && selectedPersona && (
            <div className="flex-1 flex flex-col bg-background border rounded-lg">
              {/* Header */}
              <div className="p-4 flex items-center gap-3 bg-background rounded-lg ">
                {!isMd && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPersona(null);
                      setSelectedUserId(0);
                    }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <Avatar className="h-8 w-8">
                  {/*
                  <AvatarImage src={`/avatars/${selectedPersona.id}.jpg`} />
                  */}
                  <AvatarFallback>
                    {selectedPersona.nombreCompleto?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">
                    {selectedPersona.nombreCompleto}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {connected ? "En línea" : "Desconectado"}
                  </p>
                </div>
              </div>

              {/* Mensajes */}
              <ScrollArea className="flex-1">
                <div className="p-4">
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 bg-background rounded-lg">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Selecciona un chat para escribir..."
                    disabled={!connected || !selectedUserId}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={
                      !connected || !newMessage.trim() || !selectedUserId
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
