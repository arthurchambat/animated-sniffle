import { describe, it, expect, vi, beforeEach } from "vitest";
import { completeInterviewSession, deleteFeedback } from "../interview";

// Mock de getSupabaseAdminClient
vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: vi.fn(),
}));

// Mock de next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Interview Actions", () => {
  describe("completeInterviewSession", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("devrait compléter une session avec succès", async () => {
      const mockRpcResponse = {
        data: { feedback_id: "feedback-123" },
        error: null,
      };

      const mockAdminClient = {
        rpc: vi.fn().mockResolvedValue(mockRpcResponse),
      };

      const { getSupabaseAdminClient } = await import("@/lib/supabase/admin");
      vi.mocked(getSupabaseAdminClient).mockReturnValue(mockAdminClient as any);

      const payload = {
        general: "Bonne performance",
        went_well: ["Point 1", "Point 2"],
        to_improve: ["Amélioration 1"],
        per_question: [
          {
            question: "Question 1",
            summary: "Bonne réponse",
            tips: ["Tip 1"],
            score: 80,
          },
        ],
        score_overall: 78,
      };

      const result = await completeInterviewSession("session-123", payload);

      expect(result.success).toBe(true);
      expect(result.feedbackId).toBe("feedback-123");
      expect(mockAdminClient.rpc).toHaveBeenCalledWith("complete_interview_session", {
        p_session_id: "session-123",
        p_general: payload.general,
        p_went_well: payload.went_well,
        p_to_improve: payload.to_improve,
        p_per_question: payload.per_question,
        p_score_overall: payload.score_overall,
      });
    });

    it("devrait gérer une erreur RPC", async () => {
      const mockRpcResponse = {
        data: null,
        error: { message: "Database error" },
      };

      const mockAdminClient = {
        rpc: vi.fn().mockResolvedValue(mockRpcResponse),
      };

      const { getSupabaseAdminClient } = await import("@/lib/supabase/admin");
      vi.mocked(getSupabaseAdminClient).mockReturnValue(mockAdminClient as any);

      const payload = {
        general: "Test",
        went_well: [],
        to_improve: [],
        per_question: [],
        score_overall: 0,
      };

      const result = await completeInterviewSession("session-123", payload);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("devrait gérer l'absence de client admin", async () => {
      const { getSupabaseAdminClient } = await import("@/lib/supabase/admin");
      vi.mocked(getSupabaseAdminClient).mockReturnValue(null);

      const payload = {
        general: "Test",
        went_well: [],
        to_improve: [],
        per_question: [],
        score_overall: 0,
      };

      const result = await completeInterviewSession("session-123", payload);

      expect(result.success).toBe(false);
      expect(result.error).toContain("admin client not available");
    });

    it("devrait gérer une réponse sans feedback_id", async () => {
      const mockRpcResponse = {
        data: {}, // Pas de feedback_id
        error: null,
      };

      const mockAdminClient = {
        rpc: vi.fn().mockResolvedValue(mockRpcResponse),
      };

      const { getSupabaseAdminClient } = await import("@/lib/supabase/admin");
      vi.mocked(getSupabaseAdminClient).mockReturnValue(mockAdminClient as any);

      const payload = {
        general: "Test",
        went_well: [],
        to_improve: [],
        per_question: [],
        score_overall: 0,
      };

      const result = await completeInterviewSession("session-123", payload);

      expect(result.success).toBe(false);
      expect(result.error).toContain("did not return feedback_id");
    });
  });

  describe("deleteFeedback", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("devrait supprimer un feedback avec succès", async () => {
      const mockAdminClient = {
        from: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };

      const { getSupabaseAdminClient } = await import("@/lib/supabase/admin");
      vi.mocked(getSupabaseAdminClient).mockReturnValue(mockAdminClient as any);

      const result = await deleteFeedback("session-123");

      expect(result.success).toBe(true);
      expect(mockAdminClient.from).toHaveBeenCalledWith("interview_feedback");
      expect(mockAdminClient.from).toHaveBeenCalledWith("interview_sessions");
    });

    it("devrait gérer une erreur lors de la suppression du feedback", async () => {
      const mockAdminClient = {
        from: vi.fn((table) => {
          if (table === "interview_feedback") {
            return {
              delete: vi.fn().mockReturnThis(),
              eq: vi.fn().mockResolvedValue({ error: { message: "Delete error" } }),
            };
          }
          return {
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ error: null }),
          };
        }),
      };

      const { getSupabaseAdminClient } = await import("@/lib/supabase/admin");
      vi.mocked(getSupabaseAdminClient).mockReturnValue(mockAdminClient as any);

      const result = await deleteFeedback("session-123");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("devrait gérer l'absence de client admin", async () => {
      const { getSupabaseAdminClient } = await import("@/lib/supabase/admin");
      vi.mocked(getSupabaseAdminClient).mockReturnValue(null);

      const result = await deleteFeedback("session-123");

      expect(result.success).toBe(false);
      expect(result.error).toContain("admin client not available");
    });
  });
});
