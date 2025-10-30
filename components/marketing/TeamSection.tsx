'use client';

import Link from "next/link";
import { Linkedin } from "lucide-react";
import { m, useReducedMotion } from "framer-motion";

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
  const shouldReduceMotion = useReducedMotion();
  const motionInitial = shouldReduceMotion ? undefined : { opacity: 0.4, y: 24 };
  const motionWhileInView = shouldReduceMotion ? undefined : { opacity: 1, y: 0 };
  const motionTransition = shouldReduceMotion ? undefined : { duration: 0.24, ease: "easeOut" };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {teamMembers.map((member, index) => (
        <m.article
          key={member.name}
          initial={motionInitial}
          whileInView={motionWhileInView}
          viewport={{ once: true, amount: 0.4 }}
          transition={motionTransition ? { ...motionTransition, delay: index * 0.06 } : undefined}
          className="flex h-full flex-col gap-4 rounded-3xl border border-[#0a0f1f14] bg-white/80 p-6 text-[#0a0f1f] shadow-[0_16px_40px_rgba(10,15,31,0.06)]"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0a0f1f] text-lg font-semibold text-white">
            {member.initials}
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{member.name}</h3>
            <p className="text-sm text-[#0a0f1f]/70">{member.role}</p>
          </div>
          <Link
            href={member.href}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-auto inline-flex items-center gap-2 rounded-full border border-[#0a0f1f] px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#0a0f1f] transition hover:bg-[#0a0f1f] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a0f1f]"
          >
            <Linkedin className="h-4 w-4" aria-hidden="true" />
            Linkedin
          </Link>
        </m.article>
      ))}
    </div>
  );
}
