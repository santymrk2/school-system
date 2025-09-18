// src/lib/nav.ts
export const normalizePath = (s: string) => {
  if (!s) return "/";
  const noQuery = s.split("?")[0].split("#")[0];
  const trimmed = noQuery.replace(/\/+$/, "");
  return trimmed.length ? trimmed : "/";
};

// Regla:
// - "/dashboard" activo solo si es exactamente "/dashboard"
// - Resto: activo si path === href o path empieza con `${href}/`
export const isItemActive = (pathname: string, href: string) => {
  const path = normalizePath(pathname);
  const target = normalizePath(href);
  if (target === "/dashboard") return path === "/dashboard";
  return path === target || path.startsWith(`${target}/`);
};
