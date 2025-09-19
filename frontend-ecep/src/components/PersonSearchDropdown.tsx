"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";
import type { PersonaResumenDTO } from "@/types/api-generated";

interface Props {
  searchTerm: string;
  onSearchChange: (v: string) => void;
  results: PersonaResumenDTO[];
  onSelect: (p: PersonaResumenDTO) => void;
}

const getPersonaInitials = (persona: PersonaResumenDTO) => {
  const base =
    persona.nombreCompleto ||
    [persona.nombre, persona.apellido].filter(Boolean).join(" ") ||
    persona.email ||
    "";
  if (!base) return "?";
  const letters = base
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk.charAt(0).toUpperCase());
  return letters.length ? letters.join("") : base.charAt(0).toUpperCase();
};

const getPersonaDisplayName = (persona: PersonaResumenDTO) => {
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

const getPersonaEmail = (persona: PersonaResumenDTO) => persona.email ?? "Sin email";

const getPersonaTipo = (persona: PersonaResumenDTO) => persona.tipoPersona ?? "—";

export function PersonSearchDropdown({
  searchTerm,
  onSearchChange,
  results,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {/* este div evita que el Popover se desmonte al cambiar el input */}
        <div>
          <Input
            ref={inputRef}
            placeholder="Buscar persona..."
            value={searchTerm}
            onChange={(e) => {
              onSearchChange(e.target.value);
              // no cerramos ni abrimos aquí
            }}
            onFocus={() => setOpen(true)}
          />
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 z-50"
        align="start"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()} // ← evita robar foco al input
      >
        <Command>
          {/* este input interno se queda fijo */}
          <CommandInput
            placeholder="Buscar..."
            value={searchTerm}
            onValueChange={onSearchChange}
            autoFocus
          />
          <CommandList className="max-h-72 overflow-y-auto">
            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
            {results.map((p) => (
              <CommandItem
                key={p.id}
                onSelect={() => {
                  onSelect(p);
                  setOpen(false);
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs">
                    {getPersonaInitials(p)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {getPersonaDisplayName(p)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getPersonaEmail(p)} ({getPersonaTipo(p)})
                    </p>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
