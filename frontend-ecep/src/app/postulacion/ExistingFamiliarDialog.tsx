"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import type * as DTO from "@/types/api-generated";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Props {
  open: boolean;
  persona?: DTO.PersonaDTO | null;
  dni?: string;
  loading?: boolean;
  error?: string | null;
  onConfirm: (email: string, password: string) => void | Promise<void>;
  onCancel: () => void;
}

export function ExistingFamiliarDialog({
  open,
  persona,
  dni,
  loading,
  error,
  onConfirm,
  onCancel,
}: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (open) {
      setEmail(persona?.email ?? "");
      setPassword("");
    }
  }, [open, persona?.email]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    await onConfirm(email.trim(), password);
  };

  const cancel = () => {
    if (loading) return;
    onCancel();
  };

  const fullName = [persona?.nombre, persona?.apellido].filter(Boolean).join(" ");

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? cancel() : undefined)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmá tu identidad</DialogTitle>
          <DialogDescription>
            {fullName
              ? `Encontramos un familiar registrado como ${fullName}.`
              : "Encontramos un familiar registrado."}{" "}
            Ingresá el usuario y la contraseña asociados para completar los datos
            automáticamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="existing-familiar-email">Usuario (email)</Label>
            <Input
              id="existing-familiar-email"
              type="email"
              required
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="existing-familiar-password">Contraseña</Label>
            <Input
              id="existing-familiar-password"
              type="password"
              required
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {dni ? (
            <p className="text-xs text-muted-foreground">
              DNI detectado: <span className="font-medium">{dni}</span>
            </p>
          ) : null}

          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={cancel} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando
                </>
              ) : (
                "Confirmar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
