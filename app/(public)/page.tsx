'use client';

import { useEffect, useMemo } from "react";
import { Sparkles, Workflow, Timer, BarChart3, UserCircle, Play, FileText, Trophy } from "lucide-react";
import { HeroVideoPinned } from "@/components/marketing/HeroVideoPinned";
import { Chapter } from "@/components/marketing/Chapter";
import { DiagonalSteps } from "@/components/marketing/DiagonalSteps";
import { TeamSection } from "@/components/marketing/TeamSection";
import { PricingSection } from "@/components/marketing/PricingSection";
import { ContactSection } from "@/components/marketing/ContactSection";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { NAV_SECTIONS, type NavbarTheme } from "@/components/marketing/NavbarPublic";
import { useSectionObserver } from "@/lib/scroll/useSectionObserver";
import { PageScroller } from "./PageScroller";
import { FullPageSection } from "./FullPageSection";
import { DotsNav } from "./DotsNav";
import { m, useReducedMotion } from "framer-motion";
import { BentoCard } from "@/components/ui/bento-card";

const SECTION_THEME_MAP: Record<string, NavbarTheme> = {
  hero: "dark",
  story: "dark",
  value: "dark",
  team: "light",
  pricing: "dark",
  contact: "light",
  cta: "dark"
};

const CHAPTERS = NAV_SECTIONS.map((section) => ({
  ...section,
  theme: SECTION_THEME_MAP[section.id] ?? ("dark" as NavbarTheme)
}));

const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: "Créer son profil",
    description:
      "Onboard en deux étapes, import CV / LinkedIn pour personnaliser ton plan.",
    bullet: "Configuration en moins de 3 minutes",
    icon: UserCircle
  },
  {
    step: 2,
    title: "Lancer des interviews",
    description:
      "Choisis ton template (M&A, PE, marchés…) et simule face à l'avatar IA.",
    bullet: "Scénarios calibrés sur les banques top-tier",
    icon: Play
  },
  {
    step: 3,
    title: "Recevoir du feedback",
    description:
      "Analyse instantanée, points forts / axes d'amélioration + plan 7 jours.",
    bullet: "9 axes scorés + benchmarks IB/PE",
    icon: FileText
  },
  {
    step: 4,
    title: "Décrocher son job",
    description:
      "Suis le programme, mesure ta progression et arrive prêt le jour J.",
    bullet: "Tracking de performance session après session",
    icon: Trophy
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
      "9 axes scorés, recommandations lisibles, plan d'entrainement 7 jours, exports PDF et partage coach.",
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
  const shouldReduceMotion = useReducedMotion();
  const sectionIds = useMemo(() => CHAPTERS.map((chapter) => chapter.id), []);
  const { activeId } = useSectionObserver(sectionIds);
  const activeTheme = useMemo<NavbarTheme>(
    () => (activeId ? SECTION_THEME_MAP[activeId] ?? "dark" : "dark"),
    [activeId]
  );
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
    <main className="relative h-dvh">
      <DotsNav sections={CHAPTERS} activeId={activeId} />
      <PageScroller>
        <FullPageSection id="hero" theme="dark" contentClassName="max-w-none px-0 md:px-0 xl:px-0 py-0 h-full">
          <HeroVideoPinned ctaHref="/auth/sign-in" />
        </FullPageSection>

        <FullPageSection id="story" theme="dark">
          <DiagonalSteps steps={HOW_IT_WORKS_STEPS} />
        </FullPageSection>

        <FullPageSection id="value" theme="dark" backgroundVideoSrc="/videos/video-interview2.mp4" backgroundVideoPlaybackRate={0.9}>
          <Chapter
            eyebrow="Pourquoi FinanceBro"
            title="Une orchestration complète pour dominer tes entretiens finance"
            description="Nous combinons avatar vidéo, IA en temps réel et benchmarks métiers pour transformer chaque répétition en avantage compétitif."
          >
            <div className="grid gap-8 md:grid-cols-2">
              {VALUE_PROPS.map((item, index) => (
                <m.div
                  key={item.title}
                  {...(shouldReduceMotion ? {} : {
                    initial: { opacity: 0.4, y: 24 },
                    whileInView: { opacity: 1, y: 0 },
                    transition: { duration: 0.24, delay: index * 0.08, ease: "easeOut" }
                  })}
                  viewport={{ once: true, amount: 0.5 }}
                  className="flex flex-col gap-3"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white text-white">
                    <item.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-white/80">{item.description}</p>
                </m.div>
              ))}
            </div>
          </Chapter>
        </FullPageSection>

        <FullPageSection id="team" theme="light">
          <Chapter
            eyebrow="Équipe"
            title="Trois ex-financiers devenus coachs IA"
            description="Christopher, Arthur et Arthur ont accompagné plus de 200 candidats en IB, M&A et PE. FinanceBro capture cette expertise terrain."
            variant="light"
          >
            <TeamSection />
          </Chapter>
        </FullPageSection>

        <FullPageSection id="pricing" theme="dark">
          <Chapter
            eyebrow="Plans"
            title="Choisis un plan aligné sur ton objectif recrutement"
            description="Sans engagement. Pause possible entre deux saisons. Upgrade instantané pour débloquer plus de sessions et coaching."
          >
            <PricingSection />
          </Chapter>
        </FullPageSection>

        <FullPageSection id="contact" theme="light" contentClassName="max-w-4xl">
          <Chapter
            eyebrow="Contact"
            title="Besoin d'une démo pour ton équipe carrière ou ton asso finance ?"
            description="Raconte-nous ton contexte : stage, full-time, M&A, marchés, buy-side. On répond sous 24h avec un plan de déploiement."
            variant="light"
          >
            <ContactSection />
          </Chapter>
        </FullPageSection>

        <FullPageSection id="cta" theme="dark" contentClassName="max-w-4xl" backgroundVideoSrc="/videos/video-interview3.mp4" backgroundVideoPlaybackRate={0.9}>
          <FinalCTA ctaHref="/auth/sign-in" />
        </FullPageSection>
      </PageScroller>
    </main>
  );
}
