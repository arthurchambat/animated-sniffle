import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { PageHeader } from "@/components/app/PageHeader";
import { FeedbackView } from "@/components/interview/FeedbackView";
import type { InterviewSession, InterviewFeedback } from "@/lib/types/interview";

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  // Récupérer la session et le feedback
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

  const { data: session, error: sessionError } = await supabase
    .from("interview_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (sessionError || !session) {
    notFound();
  }

  const typedSession = session as unknown as InterviewSession;

  // Vérifier que la session est complétée
  if (typedSession.status !== "completed") {
    redirect(`/interview/live/${sessionId}`);
  }

  // Récupérer le feedback
  const { data: feedback, error: feedbackError } = await supabase
    .from("interview_feedback")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  if (feedbackError || !feedback) {
    notFound();
  }

  const typedFeedback = feedback as unknown as InterviewFeedback;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analyse de votre interview"
        subtitle="Découvrez vos points forts et axes d'amélioration."
      />

      <FeedbackView
        feedback={typedFeedback}
        sessionTitle={typedSession.title}
        company={typedSession.company}
        role={typedSession.role}
        date={typedSession.created_at}
      />
    </div>
  );
}
