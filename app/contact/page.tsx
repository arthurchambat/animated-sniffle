import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";

export default function ContactPage() {
  return (
    <Section
      eyebrow="Contact"
      title="Une question ou envie de démo ?"
      subtitle="Laissez-nous un message, nous revenons vers vous en moins de 24h."
      className="gap-10"
    >
      <div className="grid gap-8 md:grid-cols-2">
        <div className="bento-card p-6">
          <h3 className="text-lg font-semibold text-slate-50">Coordonnées</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300/80">
            <li>
              <span className="font-semibold text-emerald-200">Email :</span>{" "}
              hello@financebro.app
            </li>
            <li>
              <span className="font-semibold text-emerald-200">Slack :</span> #financebro-community
            </li>
            <li>
              <span className="font-semibold text-emerald-200">Calendly :</span>{" "}
              <a href="https://cal.com/financebro" className="underline decoration-emerald-400">
                cal.com/financebro
              </a>
            </li>
          </ul>
        </div>
        <form className="bento-card flex flex-col gap-4 p-6">
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Nom / Prénom
            <input
              className="rounded-[var(--radius)] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-emerald-300 focus:outline-none"
              placeholder="Jane Doe"
              name="name"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Adresse email
            <input
              type="email"
              className="rounded-[var(--radius)] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-emerald-300 focus:outline-none"
              placeholder="jane@finance.com"
              name="email"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            Entrez votre message ici
            <textarea
              className="min-h-[160px] rounded-[var(--radius)] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-emerald-300 focus:outline-none"
              placeholder="Parlez-nous de vos besoins en préparation ou onboarding."
              name="message"
            />
          </label>
          <Button type="submit" size="lg">
            Send a message
          </Button>
        </form>
      </div>
    </Section>
  );
}
