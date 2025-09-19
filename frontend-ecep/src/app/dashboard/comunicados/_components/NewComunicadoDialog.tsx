"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Megaphone, Loader2 } from "lucide-react";
import { useViewerScope } from "@/hooks/scope/useViewerScope";
import { useScopedSecciones } from "@/hooks/scope/useScopedSecciones";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod";
import { toast } from "sonner";

type Props = {
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  onCreated?: () => void;
  asButton?: boolean;
};

type SeccionLite = {
  id: number;
  gradoSala?: string;
  division?: string;
  turno?: string;
  nombre?: string;
  nivel?: string; // INICIAL | PRIMARIO
};

export default function NewComunicadoDialog({
  open,
  onOpenChange,
  onCreated,
  asButton,
}: Props) {
  const { roles } = useViewerScope();
  const isDirector = roles.includes("DIRECTOR");
  const isAdmin = roles.includes("ADMIN");
  const isSecret = roles.includes("SECRETARY");
  const isTeacher = roles.includes("TEACHER");
  const isAdminLike = isDirector || isAdmin || isSecret;

  const { periodoEscolarId } = useActivePeriod();
  const { secciones } = useScopedSecciones({
    periodoEscolarId: periodoEscolarId ?? undefined,
  });

  const canCreate = isAdminLike || isTeacher;
  if (!canCreate) return null;

  const [isOpen, setIsOpen] = useState(!!open);
  useEffect(() => {
    if (open !== undefined) setIsOpen(open);
  }, [open]);
  const changeOpen = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    else setIsOpen(v);
  };

  const alcanceOptions = useMemo(() => {
    if (isAdminLike)
      return ["INSTITUCIONAL", "POR_NIVEL", "POR_SECCION"] as const;
    return ["POR_SECCION"] as const;
  }, [isAdminLike]);

  const [alcance, setAlcance] = useState<
    "INSTITUCIONAL" | "POR_NIVEL" | "POR_SECCION"
  >(alcanceOptions[0]!);
  const [nivel, setNivel] = useState<"INICIAL" | "PRIMARIO" | "">("");
  const [seccionId, setSeccionId] = useState<string>("");
  const [titulo, setTitulo] = useState("");
  const [cuerpo, setCuerpo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const seccionOptions = useMemo(() => {
    return (secciones ?? []).map((s: SeccionLite) => ({
      id: s.id,
      label:
        (`${s.gradoSala ?? ""} ${s.division ?? ""}`.trim() ||
          s.nombre ||
          `Sección #${s.id}`) + (s.turno ? ` (${s.turno})` : ""),
    }));
  }, [secciones]);

  useEffect(() => {
    if (!isOpen) return;
    // reset al abrir
    setAlcance(alcanceOptions[0]!);
    setNivel("");
    setSeccionId("");
    setTitulo("");
    setCuerpo("");
  }, [isOpen, alcanceOptions]);

  const canSend = useMemo(() => {
    if (!titulo.trim() || !cuerpo.trim()) return false;
    if (alcance === "POR_NIVEL" && !nivel) return false;
    if (alcance === "POR_SECCION" && !seccionId) return false;
    return true;
  }, [alcance, nivel, seccionId, titulo, cuerpo]);

  const send = async () => {
    setSubmitting(true);
    try {
      await api.comunicados.create({
        alcance,
        nivel: alcance === "POR_NIVEL" ? (nivel as any) : undefined,
        seccionId: alcance === "POR_SECCION" ? Number(seccionId) : undefined,
        titulo,
        cuerpo,
        // 🚫 sin programación: no enviamos fechaProgPublicacion
      });
      changeOpen(false);
      onCreated?.();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ??
          e?.message ??
          "No se pudo crear el comunicado",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // como botón lanzador
  if (asButton) {
    return (
      <Dialog open={isOpen} onOpenChange={changeOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => changeOpen(true)}>
            <Megaphone className="h-4 w-4 mr-1" /> Nuevo Comunicado
          </Button>
        </DialogTrigger>
        <DialogInner
          alcance={alcance}
          setAlcance={setAlcance}
          alcanceOptions={alcanceOptions as any}
          nivel={nivel}
          setNivel={setNivel}
          seccionId={seccionId}
          setSeccionId={setSeccionId}
          seccionOptions={seccionOptions}
          titulo={titulo}
          setTitulo={setTitulo}
          cuerpo={cuerpo}
          setCuerpo={setCuerpo}
          canSend={canSend}
          submitting={submitting}
          onConfirm={send}
          onClose={() => changeOpen(false)}
        />
      </Dialog>
    );
  }

  // modo controlado
  return (
    <Dialog open={isOpen} onOpenChange={changeOpen}>
      <DialogInner
        alcance={alcance}
        setAlcance={setAlcance}
        alcanceOptions={alcanceOptions as any}
        nivel={nivel}
        setNivel={setNivel}
        seccionId={seccionId}
        setSeccionId={setSeccionId}
        seccionOptions={seccionOptions}
        titulo={titulo}
        setTitulo={setTitulo}
        cuerpo={cuerpo}
        setCuerpo={setCuerpo}
        canSend={canSend}
        submitting={submitting}
        onConfirm={send}
        onClose={() => changeOpen(false)}
      />
    </Dialog>
  );
}

function DialogInner(props: {
  alcance: "INSTITUCIONAL" | "POR_NIVEL" | "POR_SECCION";
  setAlcance: (v: "INSTITUCIONAL" | "POR_NIVEL" | "POR_SECCION") => void;
  alcanceOptions: readonly ("INSTITUCIONAL" | "POR_NIVEL" | "POR_SECCION")[];
  nivel: "INICIAL" | "PRIMARIO" | "";
  setNivel: (v: "INICIAL" | "PRIMARIO" | "") => void;
  seccionId: string;
  setSeccionId: (v: string) => void;
  seccionOptions: Array<{ id: number; label: string }>;
  titulo: string;
  setTitulo: (v: string) => void;
  cuerpo: string;
  setCuerpo: (v: string) => void;
  canSend: boolean;
  submitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const {
    alcance,
    setAlcance,
    alcanceOptions,
    nivel,
    setNivel,
    seccionId,
    setSeccionId,
    seccionOptions,
    titulo,
    setTitulo,
    cuerpo,
    setCuerpo,
    canSend,
    submitting,
    onConfirm,
    onClose,
  } = props;

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Nuevo Comunicado</DialogTitle>
        <DialogDescription>
          Enviá una comunicación institucional o dirigida.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3">
        <Input
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
        <Textarea
          rows={6}
          placeholder="Cuerpo del mensaje"
          value={cuerpo}
          onChange={(e) => setCuerpo(e.target.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-1">
            <Select
              value={alcance}
              onValueChange={(v) =>
                setAlcance(v as "INSTITUCIONAL" | "POR_NIVEL" | "POR_SECCION")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Alcance" />
              </SelectTrigger>
              <SelectContent>
                {alcanceOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt === "INSTITUCIONAL"
                      ? "Institucional"
                      : opt === "POR_NIVEL"
                        ? "Por nivel"
                        : "Por sección"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {alcance === "POR_NIVEL" && (
            <div className="md:col-span-2">
              <Select
                value={nivel}
                onValueChange={(v) => setNivel(v as "INICIAL" | "PRIMARIO")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccioná nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INICIAL">Inicial</SelectItem>
                  <SelectItem value="PRIMARIO">Primario</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {alcance === "POR_SECCION" && (
            <div className="md:col-span-2">
              <Select value={seccionId} onValueChange={setSeccionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccioná sección" />
                </SelectTrigger>
                <SelectContent>
                  {seccionOptions.map((o) => (
                    <SelectItem key={o.id} value={String(o.id)}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={!canSend || submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Publicar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar envío</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Publicar este comunicado? Será visible para los destinatarios
                  definidos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onConfirm}>
                  Confirmar y publicar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
