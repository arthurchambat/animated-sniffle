import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export interface CurrentUser {
  id: string;
  email: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  plan?: string | null;
  dob?: string | null;
  school?: string | null;
  sector?: string | null;
}

const mockUser: CurrentUser = {
  id: "mock-user",
  email: "arthur@financebro.app",
  firstName: "Arthur",
  lastName: "Finance",
  plan: "free"
};

function shouldUseMockUser() {
  return process.env.NEXT_PUBLIC_ENABLE_AUTH_MOCK === "true";
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return shouldUseMockUser() ? mockUser : null;
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
            cookieStore.delete({ name, ...options });
          }
        } catch (error) {
          console.error("[FinanceBro] Unable to remove Supabase cookie", error);
        }
      }
    }
  });

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return shouldUseMockUser() ? mockUser : null;
  }

  // Try to fetch profile data from database
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, dob, school, sector, linkedin_url, cv_path")
    .eq("id", session.user.id)
    .single();

  const metadata = session.user.user_metadata ?? {};

  return {
    id: session.user.id,
    email: session.user.email ?? null,
    firstName: profile?.first_name ?? metadata.first_name ?? metadata.firstName ?? null,
    lastName: profile?.last_name ?? metadata.last_name ?? metadata.lastName ?? null,
    avatarUrl: metadata.avatar_url ?? metadata.avatarUrl ?? null,
    plan: metadata.plan ?? metadata.subscription ?? null,
    dob: profile?.dob ?? null,
    school: profile?.school ?? null,
    sector: profile?.sector ?? null
  };
}
