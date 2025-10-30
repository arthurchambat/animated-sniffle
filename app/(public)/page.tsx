'use client';

import { useEffect, useMemo } from "react";
import { Sparkles, Workflow, Timer, BarChart3 } from "lucide-react";
import { HeroVideoPinned } from "@/components/marketing/HeroVideoPinned";
import { StickySection } from "@/components/marketing/StickySection";
import { Chapter } from "@/components/marketing/Chapter";
import { ChaptersRail } from "@/components/marketing/ChaptersRail";
import { TeamSection } from "@/components/marketing/TeamSection";
import { PricingSection } from "@/components/marketing/PricingSection";
import { ContactSection } from "@/components/marketing/ContactSection";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { NAV_SECTIONS, type NavbarTheme } from "@/components/marketing/NavbarPublic";
import { useLenis } from "@/lib/scroll/useLenis";
import { useSectionObserver } from "@/lib/scroll/useSectionObserver";
import { m } from "framer-motion";

const SECTION_THEME_MAP: Record<string, NavbarTheme> = {
  hero: "dark",
  story: "dark",
  value: "dark",
  team: "dark",
  pricing: "dark",
  contact: "dark",
  cta: "dark"
};

const CHAPTERS = NAV_SECTIONS.map((section) => ({
  ...section,
  theme: SECTION_THEME_MAP[section.id] ?? ("dark" as NavbarTheme)
}));

const STORY_STEPS = [
  {
    title: "1. Se connecter",
    description:
      "Choisis ton secteur, rôle et niveau. FinanceBro récupère ton historique pour calibrer la simulation.",
    icon: Workflow
  },
  {
    title: "2. Passer l’entretien IA",
    description:
      "Avatar vidéo Beyond Presence, questions adaptatives, relances, analyse non verbale. Tout est capturé en temps réel.",
    icon: Timer
  },
  {
    title: "3. Recevoir le rapport",
    description:
      "Rapport structuré avec scoring multi-axes, plan d'entraînement priorisé et benchmarks candidats IB/PE.",
    icon: BarChart3
  }
];

const VALUE_PROPS = [
  {
    title: "Simulation haut-fidélité",
    description:
      "Scénarios calibrés sur les trames bancaires, tempo réaliste, signaux non verbaux analysés en direct.",
    icon: Sparkles
  },
  {
    title: "Feedback actionnable",
    description:
      "9 axes scorés, recommandations lisibles, plan d’entrainement 7 jours, exports PDF et partage coach.",
    icon: BarChart3
  },
  {
    title: "Benchmarks finance",
    description:
      "Comparaison vs analystes et associates, grille de réponses attendues par banque ou fonds.",
    icon: Workflow
  },
  {
    title: "Analyse instantanée",
    description:
      "Transcription, filler words, latence, tonalité : chaque session est disséquée pour accélérer tes progrès.",
    icon: Timer
  }
];

export default function PublicLandingPage() {
  useLenis();

  const sectionIds = useMemo(() => CHAPTERS.map((chapter) => chapter.id), []);
  const { activeId, activeIndex } = useSectionObserver(sectionIds);
  const activeTheme = useMemo<NavbarTheme>(
    () => (activeId ? SECTION_THEME_MAP[activeId] ?? "dark" : "dark"),
    [activeId]
  );

  useEffect(() => {
    console.log("🎯 Active section:", { activeId, activeIndex, activeTheme });
  }, [activeId, activeIndex, activeTheme]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const detail = { id: activeId ?? CHAPTERS[0]?.id ?? "hero", theme: activeTheme };
    window.dispatchEvent(new CustomEvent("chapter-change", { detail }));
    document.body.dataset.navTheme = activeTheme;
    document.body.dataset.activeChapter = activeId ?? "";
  }, [activeId, activeTheme]);

  return (
    <main className="relative">
      <ChaptersRail chapters={CHAPTERS} activeIndex={activeIndex} />
      <div className="flex flex-col gap-0 scroll-smooth snap-y snap-mandatory">
        <StickySection id="hero" className="text-slate-100">
          <HeroVideoPinned ctaHref="/auth/sign-in" />
        </StickySection>

        <StickySection id="story">
          <Chapter
            eyebrow="Comment ça marche"
            title="Ton parcours de préparation, de la connexion au rapport détaillé"
            description="FinanceBro coreographie ton entrainement avec un pipeline IA complet : onboarding, simulation, analyse et recommandations personnalisées."
          >
            <div className="grid gap-4 md:grid-cols-3">
              {STORY_STEPS.map((step, index) => (
                <m.div
                  key={step.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-left"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-200">
                    <step.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                    <p className="text-sm text-slate-200/90">{step.description}</p>
                  </div>
                </m.div>
              ))}
            </div>
          </Chapter>
        </StickySection>

        <StickySection
          id="value"
          className="bg-slate-100 text-slate-900"
          contentClassName="max-w-5xl"
        >
          <Chapter
            eyebrow="Pourquoi FinanceBro"
            title="Une orchestration complète pour dominer tes entretiens finance"
            description="Nous combinons avatar vidéo, IA en temps réel et benchmarks métiers pour transformer chaque répétition en avantage compétitif."
            variant="light"
          >
            <div className="grid gap-4 md:grid-cols-2">
              {VALUE_PROPS.map((item, index) => (
                <m.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.45, delay: index * 0.12 }}
                  className="flex h-full flex-col gap-3 rounded-3xl border border-slate-900/10 bg-white p-5 shadow-lg shadow-slate-900/5"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/10 text-slate-900">
                    <item.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </m.div>
              ))}
            </div>
          </Chapter>
        </StickySection>

        <StickySection id="team" contentClassName="max-w-5xl">
          <Chapter
            eyebrow="Équipe"
            title="Trois ex-financiers devenus coachs IA"
            description="Christopher, Arthur et Arthur ont accompagné plus de 200 candidats en IB, M&A et PE. FinanceBro capture cette expertise terrain."
          >
            <TeamSection />
          </Chapter>
        </StickySection>

        <StickySection id="pricing" contentClassName="max-w-5xl">
          <Chapter
            eyebrow="Plans"
            title="Choisis un plan aligné sur ton objectif recrutement"
            description="Sans engagement. Pause possible entre deux saisons. Upgrade instantané pour débloquer plus de sessions et coaching."
          >
            <PricingSection />
          </Chapter>
        </StickySection>

        <StickySection
          id="contact"
          className="bg-slate-100 text-slate-900"
          contentClassName="max-w-4xl"
        >
          <Chapter
            eyebrow="Contact"
            title="Besoin d’une démo pour ton équipe carrière ou ton asso finance ?"
            description="Raconte-nous ton contexte : stage, full-time, M&A, marchés, buy-side. On répond sous 24h avec un plan de déploiement."
            variant="light"
          >
            <ContactSection />
          </Chapter>
        </StickySection>

        <StickySection id="cta" contentClassName="max-w-5xl" heightClassName="pt-12 md:pt-0">
          <FinalCTA ctaHref="/auth/sign-in" />
        </StickySection>
      </div>
    </main>
  );
}
