"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DeleteFeedbackButtonProps {
  sessionId: string;
}

export function DeleteFeedbackButton({ sessionId }: DeleteFeedbackButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce feedback ? Cette action est irréversible.")) {
      return;
    }

    setIsDeleting(true);

    try {
      // Import dynamique de l'action
      const { deleteFeedback } = await import("@/lib/actions/interview");
      const result = await deleteFeedback(sessionId);

      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la suppression");
      }

      toast.success("Feedback supprimé avec succès");
      router.refresh(); // Recharger la page pour mettre à jour la liste
    } catch (error: any) {
      console.error("[DeleteFeedbackButton] Error:", error);
      toast.error(error.message || "Erreur lors de la suppression du feedback");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      className="px-3 text-rose-400 hover:bg-rose-400/10 hover:text-rose-300"
      onClick={handleDelete}
      disabled={isDeleting}
      title="Supprimer ce feedback"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
