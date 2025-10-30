'use client';

import { m, useReducedMotion } from "framer-motion";

export function ContactSection() {
  const shouldReduceMotion = useReducedMotion();
  const motionInitial = shouldReduceMotion ? undefined : { opacity: 0.4, y: 24 };
  const motionWhileInView = shouldReduceMotion ? undefined : { opacity: 1, y: 0 };
  const motionTransition = shouldReduceMotion ? undefined : { duration: 0.24, ease: "easeOut" };

  return (
    <m.form
      initial={motionInitial}
      whileInView={motionWhileInView}
      viewport={{ once: true, amount: 0.4 }}
      transition={motionTransition}
      className="grid gap-6 rounded-[28px] border border-[#0a0f1f14] bg-white p-8 shadow-[0_18px_40px_rgba(10,15,31,0.08)] md:grid-cols-2 md:p-12"
    >
      <label className="flex flex-col gap-2 text-sm text-[#0a0f1f]">
        Nom complet
        <input
          type="text"
          name="name"
          placeholder="Arthur Dupont"
          className="rounded-2xl border border-[#0a0f1f26] bg-white px-4 py-3 text-sm text-[#0a0f1f] placeholder:text-[#0a0f1f]/40 focus:border-[#0a0f1f] focus:outline-none focus:ring-2 focus:ring-[#0a0f1f]/30"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-[#0a0f1f]">
        Email professionnel
        <input
          type="email"
          name="email"
          placeholder="prenom@banque.com"
          className="rounded-2xl border border-[#0a0f1f26] bg-white px-4 py-3 text-sm text-[#0a0f1f] placeholder:text-[#0a0f1f]/40 focus:border-[#0a0f1f] focus:outline-none focus:ring-2 focus:ring-[#0a0f1f]/30"
        />
      </label>
      <label className="md:col-span-2 flex flex-col gap-2 text-sm text-[#0a0f1f]">
        Message
        <textarea
          name="message"
          rows={4}
          placeholder="Dis-nous ton prochain entretien ou le programme que tu prépares."
          className="rounded-2xl border border-[#0a0f1f26] bg-white px-4 py-3 text-sm text-[#0a0f1f] placeholder:text-[#0a0f1f]/40 focus:border-[#0a0f1f] focus:outline-none focus:ring-2 focus:ring-[#0a0f1f]/30"
        />
      </label>
      <label className="md:col-span-2 flex items-center gap-3 text-sm text-[#0a0f1f]">
        <input
          type="checkbox"
          name="demo"
          className="h-4 w-4 rounded border border-[#0a0f1f66] text-[#0a0f1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a0f1f]/30"
        />
        Demander une démo live
      </label>
      <div className="md:col-span-2 flex flex-col gap-3 text-xs text-[#0a0f1f]/70">
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-full bg-[#0a0f1f] px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-[#0a0f1f]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a0f1f]/50 md:w-fit"
        >
          Envoyer
        </button>
        <p>Réponse sous 24h ouvrées. Nous ne partageons jamais vos informations.</p>
      </div>
    </m.form>
  );
}
