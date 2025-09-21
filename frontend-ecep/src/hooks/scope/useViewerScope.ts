"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { normalizeRole, normalizeRoles } from "@/lib/auth-roles";
import { UserRole } from "@/types/api-generated";

type ViewerScopeType = "staff" | "teacher" | "family" | "student" | "guest";

const STAFF_ROLES = new Set<UserRole>([
  UserRole.ADMIN,
  UserRole.DIRECTOR,
  UserRole.SECRETARY,
  UserRole.COORDINATOR,
]);

const TEACHER_ROLES = new Set<UserRole>([
  UserRole.TEACHER,
  UserRole.ALTERNATE,
]);

const ROLE_PRIORITY: UserRole[] = [
  UserRole.DIRECTOR,
  UserRole.ADMIN,
  UserRole.SECRETARY,
  UserRole.COORDINATOR,
  UserRole.TEACHER,
  UserRole.ALTERNATE,
  UserRole.FAMILY,
  UserRole.STUDENT,
  UserRole.USER,
];

function resolveType(
  role: UserRole | null,
  available: UserRole[],
): ViewerScopeType {
  if (role) {
    if (STAFF_ROLES.has(role)) return "staff";
    if (TEACHER_ROLES.has(role)) return "teacher";
    if (role === UserRole.FAMILY) return "family";
    if (role === UserRole.STUDENT) return "student";
  }

  if (available.some((r) => STAFF_ROLES.has(r))) return "staff";
  if (available.some((r) => TEACHER_ROLES.has(r))) return "teacher";
  if (available.includes(UserRole.FAMILY)) return "family";
  if (available.includes(UserRole.STUDENT)) return "student";

  return "guest";
}

function pickActiveRole(
  selected: UserRole | null,
  available: UserRole[],
): UserRole | null {
  if (selected && available.includes(selected)) {
    return selected;
  }

  for (const role of ROLE_PRIORITY) {
    if (available.includes(role)) {
      return role;
    }
  }

  return available[0] ?? null;
}

export function useViewerScope() {
  const { user, selectedRole } = useAuth();

  return useMemo(() => {
    const availableRoles = normalizeRoles(user?.roles);
    const normalizedSelected = selectedRole
      ? normalizeRole(selectedRole)
      : null;
    const activeRole = pickActiveRole(normalizedSelected, availableRoles);

    const type = resolveType(activeRole, availableRoles);

    return {
      type,
      roles: availableRoles.map((r) => r.toString()),
      activeRole,
      availableRoles,
      personaId: user?.personaId ?? null,
      user,
    };
  }, [selectedRole, user]);
}
