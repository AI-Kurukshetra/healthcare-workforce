import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

const PUBLIC_PATHS = ["/signin", "/signup", "/_next", "/favicon.ico"];
const ROLE_HOME: Record<"admin" | "manager" | "staff", string> = {
  admin: "/dashboard/admin",
  manager: "/dashboard/manager",
  staff: "/dashboard/staff",
};

const ROLE_RULES: Record<keyof typeof ROLE_HOME, Array<(path: string) => boolean>> = {
  admin: [
    (p) => p.startsWith("/dashboard"),
    (p) => p.startsWith("/staff"),
    (p) => p.startsWith("/departments"),
    (p) => p.startsWith("/schedules"),
    (p) => p.startsWith("/time-tracking"),
    (p) => p.startsWith("/timeoff"),
    (p) => p.startsWith("/credentials"),
    (p) => p.startsWith("/reports"),
    (p) => p.startsWith("/notifications"),
    (p) => p.startsWith("/settings"),
  ],
  manager: [
    (p) => p.startsWith("/dashboard/manager"),
    (p) => p.startsWith("/staff"),
    (p) => p.startsWith("/schedules"),
    (p) => p.startsWith("/time-tracking"),
    (p) => p.startsWith("/timeoff"),
    (p) => p.startsWith("/credentials"),
    (p) => p.startsWith("/reports"),
    (p) => p.startsWith("/notifications"),
  ],
  staff: [
    (p) => p.startsWith("/dashboard/staff"),
    (p) => p.startsWith("/my-schedule"),
    (p) => p.startsWith("/time-tracking"),
    (p) => p.startsWith("/my-timeoff"),
    (p) => p.startsWith("/my-credentials"),
    (p) => p.startsWith("/notifications"),
  ],
};

const isAllowed = (path: string, role: keyof typeof ROLE_HOME) =>
  ROLE_RULES[role].some((match) => match(path));

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const res = NextResponse.next({ request: { headers: new Headers(req.headers) } });
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const redirectUrl = new URL("/signin", req.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  const { data: roleRow, error } = await supabase
    .from("user_roles")
    .select("roles(slug)")
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (error) console.error("role fetch failed", error.message);

  const role = ((roleRow as any)?.roles?.slug ??
    (session.user.user_metadata.role as string | undefined) ??
    "staff") as keyof typeof ROLE_HOME;
  const roleHome = ROLE_HOME[role] ?? ROLE_HOME.staff;

  res.cookies.set("role", role, { path: "/", httpOnly: false });

  // Redirect generic dashboard landing to role home
  if (pathname === "/dashboard" || pathname === "/") {
    return NextResponse.redirect(new URL(roleHome, req.url));
  }

  // Enforce role-based access
  if (!isAllowed(pathname, role)) return NextResponse.redirect(new URL(roleHome, req.url));

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
