"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { QuestionFeedback } from "@/lib/types/interview";

export interface CompleteInterviewPayload {
  general: string;
  went_well: string[];
  to_improve: string[];
  per_question: QuestionFeedback[];
  score_overall: number;
}

export interface CompleteInterviewResult {
  success: boolean;
  feedbackId?: string;
  error?: string;
}

/**
 * Complète une session d'interview et génère le feedback
 * Utilise la RPC Supabase `complete_interview_session`
 */
export async function completeInterviewSession(
  sessionId: string,
  payload: CompleteInterviewPayload
): Promise<CompleteInterviewResult> {
  try {
    const adminClient = getSupabaseAdminClient();

    if (!adminClient) {
      throw new Error("Supabase admin client not available");
    }

    // Appel à la RPC complete_interview_session
    // Cette RPC doit :
    // 1. Mettre à jour la session (status='completed', ended_at)
    // 2. Créer le feedback
    // 3. Retourner le feedback créé
    const { data, error } = await adminClient.rpc("complete_interview_session", {
      p_session_id: sessionId,
      p_general: payload.general,
      p_went_well: payload.went_well,
      p_to_improve: payload.to_improve,
      p_per_question: payload.per_question,
      p_score_overall: payload.score_overall,
    });

    if (error) {
      console.error("[completeInterviewSession] RPC error:", error);
      throw error;
    }

    console.log("[completeInterviewSession] RPC returned:", JSON.stringify(data, null, 2));

    // RPC returns array of rows with feedback_id
    if (!data || !Array.isArray(data) || data.length === 0 || !data[0].feedback_id) {
      console.error("[completeInterviewSession] Invalid data format:", data);
      throw new Error("RPC did not return feedback_id");
    }

    const feedbackId = data[0].feedback_id;

    // Revalider les pages de feedbacks
    revalidatePath("/feedbacks");
    revalidatePath(`/interview/feedback/${sessionId}`);

    return {
      success: true,
      feedbackId: feedbackId,
    };
  } catch (error: any) {
    console.error("[completeInterviewSession] Error:", error);
    return {
      success: false,
      error: error.message || "Une erreur est survenue lors de la complétion de l'interview",
    };
  }
}

export interface DeleteFeedbackResult {
  success: boolean;
  error?: string;
}

/**
 * Supprime un feedback (utilise le client standard avec RLS)
 * La session sera supprimée automatiquement via CASCADE
 */
export async function deleteFeedback(sessionId: string): Promise<DeleteFeedbackResult> {
  try {
    const { cookies } = await import("next/headers");
    const { createServerClient } = await import("@supabase/ssr");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase configuration missing");
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {}
        },
        remove(name, options) {
          try {
            cookieStore.delete({ name, ...options });
          } catch {}
        },
      },
    });

    // Supprimer le feedback (RLS vérifie que l'utilisateur est propriétaire)
    const { error: feedbackError } = await supabase
      .from("interview_feedback")
      .delete()
      .eq("session_id", sessionId);

    if (feedbackError) {
      throw feedbackError;
    }

    // Supprimer la session (RLS vérifie que l'utilisateur est propriétaire)
    const { error: sessionError } = await supabase
      .from("interview_sessions")
      .delete()
      .eq("id", sessionId);

    if (sessionError) {
      throw sessionError;
    }

    // Revalider les pages
    revalidatePath("/feedbacks");
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("[deleteFeedback] Error:", error);
    return {
      success: false,
      error: error.message || "Une erreur est survenue lors de la suppression du feedback",
    };
  }
}
