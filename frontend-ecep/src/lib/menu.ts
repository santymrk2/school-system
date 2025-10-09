// src/lib/menu.ts

import { UserRole } from "@/types/api-generated";
import {
  Ambulance,
  BookOpen,
  Clipboard,
  ClipboardPen,
  Home,
  Users,
  MessageSquare,
  Calendar,
  UserCheck,
  CreditCard,
  BarChart3,
  Megaphone,
} from "lucide-react";

export type MenuItem = {
  icon: any;
  label: string;
  href: string;
  roles?: UserRole[];
  color?: string;
  // ⭐ grupos libres (soporta "primary", "secondary", "third", etc.)
  group?: string;
};

export const MENU: MenuItem[] = [
  // Grupo: primary
  { icon: Home, label: "Inicio", href: "/dashboard", group: "primary" },
  {
    icon: MessageSquare,
    label: "Chat",
    href: "/dashboard/chat",
    color: "bg-secondary",
    group: "primary",
  },
  {
    icon: Megaphone,
    label: "Comunicados",
    href: "/dashboard/comunicados",
    color: "bg-pink-500",
    group: "primary",
  },

  // Grupo: secondary (por defecto, si querés podés omitir group)
  {
    icon: Users,
    label: "Alumnos",
    href: "/dashboard/alumnos",
    color: "bg-blue-500",
    group: "secondary",
  },
  {
    href: "/dashboard/calificaciones",
    label: "Calificaciones",
    icon: Clipboard,
    color: "bg-yellow-500",
    group: "secondary",
  },
  {
    href: "/dashboard/materias",
    label: "Materias",
    icon: BookOpen,
    roles: [UserRole.DIRECTOR, UserRole.SECRETARY],
    color: "bg-purple-500",
    group: "secondary",
  },
  {
    icon: ClipboardPen,
    label: "Examenes",
    href: "/dashboard/evaluaciones",
    color: "bg-purple-500",
    group: "secondary",
  },
  {
    icon: Calendar,
    label: "Asistencia",
    href: "/dashboard/asistencia",
    color: "bg-orange-500",
    group: "secondary",
  },
  {
    icon: UserCheck,
    label: "Personal",
    href: "/dashboard/personal",
    roles: [UserRole.DIRECTOR, UserRole.ADMIN, UserRole.SECRETARY],
    color: "bg-teal-500",
    group: "third",
  },
  {
    icon: Ambulance,
    label: "Accidentes",
    href: "/dashboard/actas",
    color: "bg-red-500",
    group: "secondary",
  },

  // Grupo: third (ejemplo que pediste)
  {
    icon: CreditCard,
    label: "Pagos",
    href: "/dashboard/pagos",
    color: "bg-indigo-500",
    group: "third",
  },
  {
    icon: BarChart3,
    label: "Reportes",
    href: "/dashboard/reportes",
    roles: [UserRole.DIRECTOR, UserRole.ADMIN],
    color: "bg-cyan-500",
    group: "third",
  },
];
