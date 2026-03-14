"use client";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type UserRole = "admin" | "manager" | "staff";

/**
 * Lightweight role hook for client components.
 * Prefers the role cookie set by middleware to avoid an extra network hop,
 * and falls back to Supabase session metadata.
 */
export function useUserRole() {
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const cookieRole = typeof document !== "undefined"
      ? document.cookie
          .split(";")
          .map((c) => c.trim())
          .find((c) => c.startsWith("role="))
          ?.split("=")[1] as UserRole | undefined
      : undefined;

    if (cookieRole) setRole(cookieRole);

    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      const sessionRole = (data.session?.user.user_metadata?.role as UserRole | undefined) ?? null;
      if (sessionRole) setRole(sessionRole);
      else if (!cookieRole) setRole("staff");
    });
  }, []);

  return role;
}
