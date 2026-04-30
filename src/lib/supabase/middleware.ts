import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import {
  getSupabasePublishableOrAnonKey,
  getSupabaseUrl,
} from "@/lib/supabase/config";

/** Preserve multiple Set-Cookie headers when redirecting after session refresh. */
function forwardSetCookies(from: NextResponse, to: NextResponse) {
  const headersWithGetSetCookie = from.headers as Headers & {
    getSetCookie?: () => string[];
  };
  const cookies =
    typeof headersWithGetSetCookie.getSetCookie === "function"
      ? headersWithGetSetCookie.getSetCookie()
      : [];
  for (const cookie of cookies) {
    to.headers.append("Set-Cookie", cookie);
  }
}

/** Routes that require an authenticated session. */
const PROTECTED_PREFIXES = ["/dashboard", "/onboarding", "/teams"];

export async function updateSession(request: NextRequest) {
  const url = getSupabaseUrl();
  const key = getSupabasePublishableOrAnonKey();

  if (!url || !key) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Redirect unauthenticated users away from protected routes
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  if (isProtected && !user) {
    const redirect = NextResponse.redirect(new URL("/login", request.url));
    forwardSetCookies(supabaseResponse, redirect);
    return redirect;
  }

  // Redirect authenticated users away from /login to dashboard
  if (pathname === "/login" && user) {
    const redirect = NextResponse.redirect(new URL("/dashboard", request.url));
    forwardSetCookies(supabaseResponse, redirect);
    return redirect;
  }

  return supabaseResponse;
}
