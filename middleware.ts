import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const mockSessionEnabled = process.env.NEXT_PUBLIC_ENABLE_AUTH_MOCK === "true";

  const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);

  if (!hasSupabaseEnv) {
    if (mockSessionEnabled && pathname === "/") {
      return NextResponse.redirect(new URL("/home", request.url));
    }

    if (!mockSessionEnabled && pathname.startsWith("/home")) {
      const redirectUrl = new URL("/", request.url);
      redirectUrl.searchParams.set("from", "/home");
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  }

  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      get(name) {
        return request.cookies.get(name)?.value;
      },
      set(name, value, options) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name, options) {
        response.cookies.set({ name, value: "", ...options, maxAge: 0 });
      }
    }
  });

  if (mockSessionEnabled) {
    if (pathname.startsWith("/auth")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return response;
  }

  const {
    data: { session }
  } = await supabase.auth.getSession();

  const isAuthRoute = pathname.startsWith("/auth");

  if (session) {
    // Redirect authenticated users from auth pages to dashboard
    if (isAuthRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return response;
  }

  // Redirect unauthenticated users from protected routes to sign-in
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/home") ||
    pathname.startsWith("/interview") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/settings")
  ) {
    const redirectUrl = new URL("/auth/sign-in", request.url);
    redirectUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/auth/:path*",
    "/dashboard/:path*",
    "/home/:path*",
    "/interview/:path*",
    "/account/:path*",
    "/settings/:path*",
    "/our-team/:path*",
    "/support/:path*"
  ]
};
