'use client';

import { useEffect, useMemo } from "react";
import { Sparkles, Workflow, Timer, BarChart3, UserCircle, Play, FileText, Trophy, TrendingUp, Target, Award, Mail } from "lucide-react";
import { HeroVideoPinned } from "@/components/marketing/HeroVideoPinned";
import { Chapter } from "@/components/marketing/Chapter";
import { DiagonalSteps } from "@/components/marketing/DiagonalSteps";
import { PricingSection } from "@/components/marketing/PricingSection";
import { NAV_SECTIONS, type NavbarTheme } from "@/components/marketing/NavbarPublic";
import { useSectionObserver } from "@/lib/scroll/useSectionObserver";
import { PageScroller } from "./PageScroller";
import { FullPageSection } from "./FullPageSection";
import { DotsNav } from "./DotsNav";
import { m, useReducedMotion } from "framer-motion";
import Link from "next/link";

const SECTION_THEME_MAP: Record<string, NavbarTheme> = {
  hero: "dark",
  story: "dark",
  value: "dark",
  demo: "dark",
  social: "light",
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
    description: "Configuration rapide avec import CV/LinkedIn (simulé en démo).",
    bullet: "Onboarding personnalisé",
    icon: UserCircle
  },
  {
    step: 2,
    title: "Lancer des interviews",
    description: "Simulations IA face à un avatar virtuel (données front-end).",
    bullet: "Scénarios M&A, PE, marchés",
    icon: Play
  },
  {
    step: 3,
    title: "Recevoir du feedback",
    description: "Analyse instantanée avec scoring sur 9 axes (version démo).",
    bullet: "Feedback actionnable",
    icon: FileText
  },
  {
    step: 4,
    title: "Suivre sa progression",
    description: "Dashboard avec KPI et graphiques (données simulées).",
    bullet: "Tracking de performance",
    icon: Trophy
  }
];

const DEMO_FEATURES = [
  {
    title: "IA d'entretien vidéo",
    description: "Avatar animé qui pose des questions calibrées IB/PE. Version démo : interactions simulées sans backend réel.",
    icon: Sparkles
  },
  {
    title: "Feedback instantané",
    description: "Scoring multi-axes, détection de filler words, analyse de tonalité. Démo : algorithmes front-end avec données factices.",
    icon: BarChart3
  },
  {
    title: "Benchmarks finance",
    description: "Comparaison vs analystes top-tier, grilles de réponses par banque. Démo : benchmarks statiques pré-générés.",
    icon: Workflow
  },
  {
    title: "Export PDF & partage",
    description: "Rapports professionnels téléchargeables et partageables avec coachs. Démo : génération côté client uniquement.",
    icon: Timer
  }
];

const SOCIAL_PROOF_LOGOS = [
  "Goldman Sachs", "JP Morgan", "Lazard", "Rothschild", "BNP Paribas"
];

const DEMO_KPI = [
  { label: "Score moyen", value: "8.2/10", icon: Target, color: "text-emerald-400" },
  { label: "Sessions simulées", value: "247", icon: Play, color: "text-blue-400" },
  { label: "Taux de progression", value: "+34%", icon: TrendingUp, color: "text-purple-400" }
];

export default function PublicLandingPage() {
  const shouldReduceMotion = useReducedMotion();
  const sectionIds = useMemo(() => CHAPTERS.map((chapter) => chapter.id), []);
  const { activeId } = useSectionObserver(sectionIds);
  const activeTheme = useMemo<NavbarTheme>(
    () => CHAPTERS.find((ch) => ch.id === activeId)?.theme ?? "dark",
    [activeId]
  );

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--nav-theme", activeTheme);
  }, [activeTheme]);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#0a0f1f] text-white">
      <DotsNav activeId={activeId} sections={CHAPTERS} />
      
      <PageScroller>
        <FullPageSection id="hero" theme="dark" contentClassName="max-w-none px-0 md:px-0 xl:px-0 py-0 h-full">
          <HeroVideoPinned ctaHref="/auth/sign-in" />
        </FullPageSection>

        <FullPageSection id="story" theme="dark">
          <DiagonalSteps steps={HOW_IT_WORKS_STEPS} />
        </FullPageSection>

        <FullPageSection id="value" theme="dark" backgroundVideoSrc="/videos/video-interview2.mp4" backgroundVideoPlaybackRate={0.9}>
          <Chapter
            eyebrow="Fonctionnalités simulées"
            title="Démo interactive sans backend"
            description="Explorez les capacités de FinanceBro avec des données simulées côté client. Version de démonstration technique pour arthurchamlbat."
          >
            <div className="grid gap-8 md:grid-cols-2">
              {DEMO_FEATURES.map((item, index) => (
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

        {/* Mini Dashboard Démo */}
        <FullPageSection id="demo" theme="dark">
          <Chapter
            eyebrow="Dashboard démo"
            title="Aperçu des métriques de performance"
            description="KPI et analytics simulés pour illustrer le suivi de progression. Données fictives générées côté front."
          >
            <div className="space-y-8">
              {/* KPI Cards */}
              <div className="grid gap-6 md:grid-cols-3">
                {DEMO_KPI.map((kpi, index) => (
                  <m.div
                    key={kpi.label}
                    {...(shouldReduceMotion ? {} : {
                      initial: { opacity: 0, scale: 0.9 },
                      whileInView: { opacity: 1, scale: 1 },
                      transition: { duration: 0.3, delay: index * 0.1 }
                    })}
                    viewport={{ once: true }}
                    className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/8 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ${kpi.color}`}>
                        <kpi.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs text-white/60 uppercase tracking-wider">{kpi.label}</p>
                        <p className="text-2xl font-bold text-white">{kpi.value}</p>
                      </div>
                    </div>
                  </m.div>
                ))}
              </div>

              {/* Fake Progress Chart */}
              <m.div
                {...(shouldReduceMotion ? {} : {
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                  transition: { duration: 0.4 }
                })}
                viewport={{ once: true }}
                className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-8"
              >
                <h3 className="text-lg font-semibold text-white mb-6">Évolution du score moyen (simulé)</h3>
                <div className="space-y-4">
                  {[
                    { label: "Semaine 1", progress: 45, color: "bg-red-500" },
                    { label: "Semaine 2", progress: 62, color: "bg-orange-500" },
                    { label: "Semaine 3", progress: 75, color: "bg-yellow-500" },
                    { label: "Semaine 4", progress: 82, color: "bg-emerald-500" }
                  ].map((week, idx) => (
                    <div key={week.label} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">{week.label}</span>
                        <span className="text-white font-semibold">{week.progress}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                        <m.div
                          {...(shouldReduceMotion ? { style: { width: `${week.progress}%` } } : {
                            initial: { width: 0 },
                            whileInView: { width: `${week.progress}%` },
                            transition: { duration: 0.8, delay: 0.2 + idx * 0.1 }
                          })}
                          viewport={{ once: true }}
                          className={`h-full ${week.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-white/50 text-center">* Données simulées à titre de démonstration uniquement</p>
              </m.div>
            </div>
          </Chapter>
        </FullPageSection>

        {/* Social Proof */}
        <FullPageSection id="social" theme="light">
          <Chapter
            eyebrow="Preuves sociales"
            title="+200 candidats coachés"
            description="Portfolio de démonstration - Logos et statistiques illustratifs pour arthurchamlbat."
            variant="light"
          >
            <div className="space-y-8">
              <m.div
                {...(shouldReduceMotion ? {} : {
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                  transition: { duration: 0.4 }
                })}
                viewport={{ once: true }}
                className="flex flex-wrap items-center justify-center gap-8"
              >
                {SOCIAL_PROOF_LOGOS.map((logo) => (
                  <div
                    key={logo}
                    className="px-6 py-3 rounded-lg bg-[#0a0f1f]/5 border border-[#0a0f1f]/10"
                  >
                    <span className="text-sm font-semibold text-[#0a0f1f]/60">{logo}</span>
                  </div>
                ))}
              </m.div>
              <p className="text-center text-sm text-[#0a0f1f]/60">
                Banques et fonds partenaires (démonstration)
              </p>
            </div>
          </Chapter>
        </FullPageSection>

        <FullPageSection id="pricing" theme="dark">
          <Chapter
            eyebrow="Tarifs"
            title="Packs de crédits (version démo)"
            description="Modèle économique proposé - Paiement à l'achat sans abonnement."
          >
            <PricingSection />
          </Chapter>
        </FullPageSection>

        <FullPageSection id="contact" theme="light">
          <Chapter
            eyebrow="Contact"
            title="Demander une démo personnalisée"
            description="Intéressé par FinanceBro ? Contactez-nous pour découvrir le produit complet."
            variant="light"
          >
            <div className="flex flex-col items-center gap-6">
              <a
                href="mailto:arthurchambat@gmail.com"
                className="inline-flex items-center gap-3 rounded-full bg-[#0a0f1f] px-8 py-4 text-base font-semibold text-white hover:bg-[#0a0f1f]/90 transition-colors"
              >
                <Mail className="h-5 w-5" />
                Envoyer un message
              </a>
              <p className="text-sm text-[#0a0f1f]/60">Réponse sous 24h pour toute demande de démo</p>
            </div>
          </Chapter>
        </FullPageSection>

        <FullPageSection id="cta" theme="dark" backgroundVideoSrc="/videos/video-interview3.mp4" backgroundVideoPlaybackRate={0.9}>
          <Chapter
            eyebrow="Prêt à tester"
            title="Explorez la version démo"
            description="Créez un compte pour accéder à l'interface complète. Fonctionnalités simulées, aucune donnée réelle requise."
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/sign-in"
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-semibold text-[#0a0f1f] hover:bg-white/90 transition-colors"
              >
                Accéder à la démo
              </Link>
              <a
                href="mailto:arthurchambat@gmail.com"
                className="inline-flex items-center gap-2 justify-center rounded-full border-2 border-white px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-colors"
              >
                <Mail className="h-5 w-5" />
                Nous contacter
              </a>
            </div>
          </Chapter>
        </FullPageSection>
      </PageScroller>
    </main>
  );
}
