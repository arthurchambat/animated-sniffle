'use client';

import Link from "next/link";
import Image from "next/image";
import { Linkedin } from "lucide-react";
import { m, useReducedMotion } from "framer-motion";

const teamMembers = [
  {
    name: "Christopher Foliard",
    role: "Co-fondateur · Produit & Avatar IA",
    href: "https://www.linkedin.com/in/christopher-foliard/",
    image: "/images/Foliard-Christopher-sd.jpg"
  },
  {
    name: "Arthur Chambat",
    role: "Co-fondateur · Stratégie & Coaching",
    href: "https://www.linkedin.com/in/arthur-chambat/",
    image: "/images/Chambat-Arthur.JPG"
  },
  {
    name: "Arthur Riché",
    role: "Co-fondateur · Data & Expérience candidat",
    href: "https://www.linkedin.com/in/arthur-rich%C3%A9-7a277719a/",
    image: "/images/Riche-Arthur.JPG"
  }
];

export function TeamSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {teamMembers.map((member, index) => {
        const motionProps = shouldReduceMotion
          ? {}
          : {
              initial: { opacity: 0.4, y: 24 },
              whileInView: { opacity: 1, y: 0 },
              transition: { duration: 0.24, delay: index * 0.06, ease: "easeOut" as const }
            };

        return (
          <m.article
            key={member.name}
            {...motionProps}
            viewport={{ once: true, amount: 0.4 }}
            className="flex h-full flex-col gap-4 rounded-3xl border border-[#0a0f1f14] bg-white/80 p-6 text-[#0a0f1f] shadow-[0_16px_40px_rgba(10,15,31,0.06)]"
          >
          <div className="relative h-20 w-20 overflow-hidden rounded-full bg-[#0a0f1f]">
            <Image
              src={member.image}
              alt={`Photo de ${member.name}`}
              fill
              className="object-cover"
              sizes="80px"
            />
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
        );
      })}
    </div>
  );
}
