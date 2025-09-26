// src/hooks/useVisibleMenu.ts
"use client";
import { useMemo } from "react";
import { MENU, type MenuItem } from "@/lib/menu";
import type { UserRole } from "@/types/api-generated";

const HIDDEN_ITEMS_BY_ROLE: Partial<Record<UserRole, string[]>> = {
  [UserRole.ADMIN]: [
    "/dashboard/calificaciones",
    "/dashboard/asistencia",
    "/dashboard/evaluaciones",
  ],
};

export function useVisibleMenu(role?: UserRole | null) {
  return useMemo<MenuItem[]>(() => {
    if (!role) return MENU.filter((i) => !i.roles);

    const hiddenItems = new Set(HIDDEN_ITEMS_BY_ROLE[role] ?? []);

    return MENU.filter(
      (i) => (!i.roles || i.roles.includes(role)) && !hiddenItems.has(i.href),
    );
  }, [role]);
}
