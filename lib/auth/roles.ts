import { NextRequest, NextResponse } from "next/server";

export type Role = "admin" | "manager" | "staff";

export function assertRole(req: NextRequest, allowed: Role[]) {
  const role = req.headers.get("x-role") as Role | null;
  if (!role || !allowed.includes(role)) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }
  return null;
}
