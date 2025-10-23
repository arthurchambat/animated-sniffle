"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const client = createSupabaseBrowserClient();
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) {
          throw error;
        }
        toast.success("Connexion réussie, ouverture du dashboard.");
      } else {
        const response = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, firstName, lastName })
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error ?? "Impossible de créer le compte.");
        }
        toast.success("Compte créé ! Vérifiez votre email pour activer l'accès.");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Une erreur est survenue, réessayez.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {mode === "register" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Nom
            <input
              className="rounded-[var(--radius)] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-emerald-300 focus:outline-none"
              placeholder="Dupont"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Prénom
            <input
              className="rounded-[var(--radius)] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-emerald-300 focus:outline-none"
              placeholder="Claire"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required
            />
          </label>
        </div>
      ) : null}

      <label className="flex flex-col gap-2 text-sm text-slate-200">
        Mail
        <input
          type="email"
          className="rounded-[var(--radius)] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-emerald-300 focus:outline-none"
          placeholder="prenom@banque.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-slate-200">
        Mot de passe
        <input
          type="password"
          className="rounded-[var(--radius)] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-emerald-300 focus:outline-none"
          placeholder="********"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>

      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Chargement..." : mode === "login" ? "Sign in" : "Sign up"}
      </Button>
    </form>
  );
}
