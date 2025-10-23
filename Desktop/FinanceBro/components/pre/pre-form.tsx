"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const rounds = [
  "Screening",
  "Superday",
  "Coaching interne",
  "Session libre"
];

const companies = ["JP Morgan", "Goldman Sachs", "Bank of America"];

const roles = [
  "Sales & Trading",
  "Structuration",
  "M&A",
  "Coverage",
  "PE Buyout",
  "Growth"
];

export function PreInterviewForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    interviewName: "",
    round: rounds[0],
    company: companies[0],
    role: roles[0],
    position: "",
    offerUrl: "",
    cvFile: null as File | null
  });

  const handleChange = (key: keyof typeof form, value: string | File | null) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      toast.success("Briefing généré ! Préparez-vous pour la session.");
      router.push("/run");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm text-slate-200">
        Nom de l’interview
        <input
          className="rounded-[var(--radius)] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-emerald-300 focus:outline-none"
          value={form.interviewName}
          onChange={(event) => handleChange("interviewName", event.target.value)}
          required
        />
      </label>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-2 text-sm text-slate-200">
          What round
          <select
            className="rounded-[var(--radius)] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-emerald-300 focus:outline-none"
            value={form.round}
            onChange={(event) => handleChange("round", event.target.value)}
          >
            {rounds.map((round) => (
              <option key={round}>{round}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm text-slate-200">
          What company
          <select
            className="rounded-[var(--radius)] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-emerald-300 focus:outline-none"
            value={form.company}
            onChange={(event) => handleChange("company", event.target.value)}
          >
            {companies.map((company) => (
              <option key={company}>{company}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm text-slate-200">
          What role
          <select
            className="rounded-[var(--radius)] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-emerald-300 focus:outline-none"
            value={form.role}
            onChange={(event) => handleChange("role", event.target.value)}
          >
            {roles.map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-2 text-sm text-slate-200">
        À quel poste tu postules
        <input
          className="rounded-[var(--radius)] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-emerald-300 focus:outline-none"
          value={form.position}
          onChange={(event) => handleChange("position", event.target.value)}
          required
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-slate-200">
        Déposer l’offre
        <input
          className="rounded-[var(--radius)] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-emerald-300 focus:outline-none"
          placeholder="Lien vers l'offre"
          value={form.offerUrl}
          onChange={(event) => handleChange("offerUrl", event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-slate-200">
        Déposer son CV (option)
        <input
          type="file"
          className="rounded-[var(--radius)] border border-dashed border-white/20 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-emerald-300 focus:outline-none"
          onChange={(event) => handleChange("cvFile", event.target.files?.[0] ?? null)}
        />
      </label>
      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Préparation..." : "Ready to start?"}
      </Button>
    </form>
  );
}
