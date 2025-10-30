'use client';

import { PageHeader } from "@/components/app/PageHeader";
import { BentoCard } from "@/components/ui/bento-card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes réglages"
        subtitle="Personnalisez votre expérience FinanceBro."
      />

      <div className="grid gap-4">
        <BentoCard padding="lg">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Préférences</h2>
          <div className="space-y-4 text-sm">
            <div>
              <label className="text-slate-300 block mb-2">Langue</label>
              <select className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-slate-100">
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="text-slate-300 block mb-2">Thème</label>
              <select className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-slate-100">
                <option value="dark">Sombre</option>
                <option value="light">Clair</option>
                <option value="auto">Automatique</option>
              </select>
            </div>
          </div>
        </BentoCard>

        <BentoCard padding="lg">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Notifications</h2>
          <div className="space-y-3 text-sm">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="rounded border-white/10 bg-slate-900" defaultChecked />
              <span className="text-slate-300">Recevoir les emails de feedbacks</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="rounded border-white/10 bg-slate-900" defaultChecked />
              <span className="text-slate-300">Recevoir les conseils hebdomadaires</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="rounded border-white/10 bg-slate-900" />
              <span className="text-slate-300">Recevoir les actualités produit</span>
            </label>
          </div>
        </BentoCard>
      </div>
    </div>
  );
}
