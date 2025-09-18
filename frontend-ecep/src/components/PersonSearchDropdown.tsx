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
import type { PersonaUsuarioDTO } from "@/types/entities";

interface Props {
  searchTerm: string;
  onSearchChange: (v: string) => void;
  results: PersonaUsuarioDTO[];
  onSelect: (p: PersonaUsuarioDTO) => void;
}

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
                    {p.nombre.charAt(0)}
                    {p.apellido.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {p.nombre} {p.apellido}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.email} ({p.tipo})
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
