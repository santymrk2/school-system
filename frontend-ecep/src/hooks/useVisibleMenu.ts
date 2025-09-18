// src/hooks/useVisibleMenu.ts
"use client";
import { useMemo } from "react";
import { MENU, type MenuItem } from "@/lib/menu";
import type { UserRole } from "@/types/api-generated";

export function useVisibleMenu(role?: UserRole | null) {
  return useMemo<MenuItem[]>(() => {
    if (!role) return MENU.filter((i) => !i.roles);
    return MENU.filter((i) => !i.roles || i.roles.includes(role));
  }, [role]);
}
