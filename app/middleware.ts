import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/db";

const PUBLIC_PATHS = ["/signin", "/signup", "/_next", "/favicon.ico"];
const ROLE_HOME: Record<string, string> = {
  admin: "/dashboard/admin",
  manager: "/dashboard/manager",
  staff: "/dashboard/staff",
};

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

  const role = (roleRow as any)?.roles?.slug ?? (session.user.user_metadata.role as string | undefined) ?? "staff";
  const roleHome = ROLE_HOME[role] ?? ROLE_HOME.staff;

  res.cookies.set("role", role, { path: "/", httpOnly: false });

  const isDashboardRoot = pathname === "/dashboard" || pathname === "/";
  const isDashboardSection = pathname.startsWith("/dashboard/");
  const requestedSection = pathname.split("/")[2];

  if (isDashboardRoot) {
    return NextResponse.redirect(new URL(roleHome, req.url));
  }

  if (isDashboardSection && requestedSection && ROLE_HOME[requestedSection] && requestedSection !== role) {
    return NextResponse.redirect(new URL(roleHome, req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
