"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DownloadPanel() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "demo-session",
          transcript: [],
          metrics: { summary: "Demo export", strengths: [], priorities: [] }
        })
      });

      if (!response.ok) {
        throw new Error("Impossible de générer le feedback.");
      }

      const payload = await response.json();
      const blob = new Blob([payload.report], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "financebro-feedback.md";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Feedback exporté en Markdown.");
    } catch (error) {
      console.error(error);
      toast.error("Export échoué. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Button onClick={handleDownload} disabled={loading}>
        {loading ? "Génération..." : "Download PDF Feedback"}
      </Button>
      <p className="text-xs text-slate-300/80">
        L&apos;export Markdown peut être converti en PDF via votre viewer favori. Le PDF natif est en
        cours d&apos;intégration (Chromium Headless).
      </p>
    </div>
  );
}
