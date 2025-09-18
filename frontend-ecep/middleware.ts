// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { nextUrl } = req;

  const isProtected =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname === "/select-rol";

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/", req.url)); // 👈 login en "/"
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/select-rol"],
};
