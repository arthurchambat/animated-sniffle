'use client';

import { m } from "framer-motion";

export function ContactSection() {
  return (
    <m.form
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="grid gap-6 rounded-[32px] border border-slate-900/10 bg-white p-8 shadow-lg shadow-slate-900/5 md:grid-cols-2 md:p-12"
    >
      <label className="flex flex-col gap-2 text-sm text-slate-700">
        Nom complet
        <input
          type="text"
          name="name"
          placeholder="Arthur Dupont"
          className="rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-slate-700">
        Email professionnel
        <input
          type="email"
          name="email"
          placeholder="prenom@banque.com"
          className="rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </label>
      <label className="md:col-span-2 flex flex-col gap-2 text-sm text-slate-700">
        Message
        <textarea
          name="message"
          rows={4}
          placeholder="Dis-nous ton prochain entretien ou le programme que tu prépares."
          className="rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </label>
      <label className="md:col-span-2 flex items-center gap-3 text-sm text-slate-700">
        <input
          type="checkbox"
          name="demo"
          className="h-4 w-4 rounded border border-slate-300 bg-white text-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20"
        />
        Demander une démo live
      </label>
      <div className="md:col-span-2 flex flex-col gap-3 text-xs text-slate-600">
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/80 md:w-fit"
        >
          Envoyer
        </button>
        <p>Réponse sous 24h ouvrées. Nous ne partageons jamais vos informations.</p>
      </div>
    </m.form>
  );
}
