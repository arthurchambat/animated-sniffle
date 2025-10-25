import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { LiveInterviewClient } from "@/components/interview/LiveInterviewClient";
import type { InterviewSession } from "@/lib/types/interview";

export default async function LiveInterviewPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  // Récupérer la session
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
      set() {},
      remove() {},
    },
  });

  const { data: session, error } = await supabase
    .from("interview_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (error || !session) {
    notFound();
  }

  const typedSession = session as unknown as InterviewSession;

  // Si la session est en draft, la passer en live
  if (typedSession.status === "draft") {
    await supabase
      .from("interview_sessions")
      .update({
        status: "live",
        started_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    typedSession.status = "live";
    typedSession.started_at = new Date().toISOString();
  }

  // Si déjà completed, rediriger vers feedback
  if (typedSession.status === "completed") {
    redirect(`/interview/feedback/${sessionId}`);
  }

  const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Utilisateur";

  return <LiveInterviewClient session={typedSession} userName={userName} />;
}
