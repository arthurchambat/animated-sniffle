"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function LandingActions() {
  const [loading, setLoading] = useState(false);

  const handleSuggest = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: "market_finance",
          role: "sales_trading",
          level: "analyst"
        })
      });

      if (!response.ok) {
        throw new Error("La suggestion IA a échoué.");
      }

      const payload = await response.json();
      toast.success("Suggestion IA prête", {
        description: payload.suggestion ?? "Session recommandée sur mesure."
      });
    } catch (error) {
      console.error(error);
      toast.error("Impossible de générer la suggestion IA pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  const handleToast = () => {
    toast.message("Connexion micro", {
      description: "Vérifiez votre micro avant de lancer la session.",
      action: {
        label: "Tester",
        onClick: () => console.log("Test micro déclenché")
      }
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius)] border border-white/10 bg-white/5 p-6 backdrop-blur">
      <p className="text-sm text-slate-200">
        Lancez une session immersive en 3 clics : briefing personnalisé, avatar Beyond Presence,
        scoring IA en direct.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/pre">
          <Button size="lg">Commencer</Button>
        </Link>
        <Button variant="secondary" onClick={handleToast}>
          Tester mes devices
        </Button>
        <Button variant="ghost" onClick={handleSuggest} disabled={loading}>
          {loading ? "Chargement..." : "Suggestion IA"}
        </Button>
      </div>
    </div>
  );
}
