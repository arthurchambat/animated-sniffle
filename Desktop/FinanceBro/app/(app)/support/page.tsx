'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/PageHeader";
import { BentoCard } from "@/components/ui/bento-card";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    requestDemo: false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success("Message envoyé ! Nous vous répondrons sous 24h.");
    setFormData({ name: "", email: "", message: "", requestDemo: false });
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nous contacter"
        subtitle="Une question ? Besoin d'une démo pour votre équipe ? Écrivez-nous."
      />

      <BentoCard padding="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
              Nom
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Votre nom complet"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="votre.email@exemple.com"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
              Message
            </label>
            <textarea
              id="message"
              required
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Décrivez votre demande..."
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.requestDemo}
              onChange={(e) => setFormData({ ...formData, requestDemo: e.target.checked })}
              className="rounded border-white/10 bg-slate-900"
            />
            <span className="text-sm text-slate-300">Je souhaite demander une démo</span>
          </label>

          <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Envoi en cours..." : "Envoyer le message"}
          </Button>
        </form>
      </BentoCard>
    </div>
  );
}
