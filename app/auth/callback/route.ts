import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    const redirectUrl = new URL("/auth/sign-in", request.url);
    redirectUrl.searchParams.set("status", "missing_code");
    return NextResponse.redirect(redirectUrl);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const redirectUrl = new URL("/auth/sign-in", request.url);
    redirectUrl.searchParams.set("status", "missing_env");
    return NextResponse.redirect(redirectUrl);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        try {
          return cookieStore.get(name)?.value;
        } catch (error) {
          console.error("[FinanceBro] Unable to read Supabase cookie", error);
          return undefined;
        }
      },
      set(name, value, options) {
        try {
          if (typeof cookieStore.set === "function") {
            cookieStore.set({ name, value, ...options });
          }
        } catch (error) {
          console.error("[FinanceBro] Unable to set Supabase cookie", error);
        }
      },
      remove(name, options) {
        try {
          if (typeof cookieStore.delete === "function") {
            if (options) {
              cookieStore.delete({ name, ...options });
            } else {
              cookieStore.delete(name);
            }
          }
        } catch (error) {
          console.error("[FinanceBro] Unable to remove Supabase cookie", error);
        }
      }
    }
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const redirectUrl = new URL("/auth/sign-in", request.url);
    redirectUrl.searchParams.set("status", "callback_error");
    redirectUrl.searchParams.set("message", error.message);
    return NextResponse.redirect(redirectUrl);
  }

  // Check if this is a NEW user (first time with Google OAuth)
  // Only redirect to onboarding if profile doesn't have first_name/last_name
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .single();

    // If no first_name/last_name, this is a new Google OAuth user → onboarding
    if (!profile?.first_name || !profile?.last_name) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  // Existing users go directly to dashboard
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
