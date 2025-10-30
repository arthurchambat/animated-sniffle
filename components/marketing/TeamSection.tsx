'use client';

import Link from "next/link";
import { Linkedin } from "lucide-react";
import { m } from "framer-motion";

const teamMembers = [
  {
    name: "Christopher",
    role: "Co-fondateur · Produit & Avatar IA",
    href: "https://www.linkedin.com",
    initials: "C"
  },
  {
    name: "Arthur L.",
    role: "Co-fondateur · Stratégie & Coaching",
    href: "https://www.linkedin.com",
    initials: "AL"
  },
  {
    name: "Arthur P.",
    role: "Co-fondateur · Data & Expérience candidat",
    href: "https://www.linkedin.com",
    initials: "AP"
  }
];

export function TeamSection() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {teamMembers.map((member, index) => (
        <m.article
          key={member.name}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-emerald-500/10"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-lg font-semibold text-emerald-200">
            {member.initials}
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">{member.name}</h3>
            <p className="text-sm text-slate-300/90">{member.role}</p>
          </div>
          <Link
            href={member.href}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-auto inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-200 transition hover:border-emerald-400/40 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
          >
            <Linkedin className="h-4 w-4" aria-hidden="true" />
            Linkedin
          </Link>
        </m.article>
      ))}
    </div>
  );
}
