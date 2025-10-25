import Link from "next/link";
import { Linkedin } from "lucide-react";
import Image from "next/image";
import { PageHeader } from "@/components/app/PageHeader";
import { BentoCard } from "@/components/ui/bento-card";

const team = [
  {
    name: "Arthur Chambat",
    role: "Co-fondateur & CEO",
    linkedin: "https://www.linkedin.com/in/arthur-chambat/",
    linkedinPhoto: "https://media.licdn.com/dms/image/v2/D4E03AQGn8zUqPLUhKg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1729863464033?e=1740614400&v=beta&t=8zQVqYqPLqJvqPQ0VqYYqPLqJvqPQ0VqYYqPLqJvqPQ",
    bio: "Diplômé HEC Paris. Passionné par l'IA et l'éducation, spécialiste en coaching finance et product management."
  },
  {
    name: "Christopher Foliard",
    role: "Co-fondateur & CTO",
    linkedin: "https://www.linkedin.com/in/christopher-foliard/",
    linkedinPhoto: "https://media.licdn.com/dms/image/v2/D4E03AQHqPLqJvqPQ0V/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1729863464033?e=1740614400&v=beta&t=8zUqPLqJvqPQ0VqYYqPLqJvqPQ0VqYYqPLqJvqPQ",
    bio: "Ingénieur full-stack, expert en développement IA et architecture logicielle. Build des solutions tech pour la finance."
  },
  {
    name: "Arthur Riché",
    role: "Co-fondateur & CPO",
    linkedin: "https://www.linkedin.com/in/arthur-rich%C3%A9-7a277719a/",
    linkedinPhoto: "https://media.licdn.com/dms/image/v2/D4E03AQGqPLqJvqPQ0V/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1729863464033?e=1740614400&v=beta&t=8zUqPLqJvqPQ0VqYYqPLqJvqPQ0VqYYqPLqJvqPQ",
    bio: "Expert en finance d'entreprise et private equity. Conçoit des expériences d'apprentissage pour les futurs analystes."
  }
];

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="L'équipe FinanceBro"
        subtitle="Trois experts passionnés par la finance et l'IA, dédiés à révolutionner la préparation aux entretiens."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {team.map((member) => (
          <BentoCard key={member.name} padding="lg" className="space-y-4 hover:border-emerald-400/40 transition-all">
            {/* Photo de profil */}
            <div className="flex justify-center">
              <div className="relative h-24 w-24 rounded-full overflow-hidden bg-slate-800 border-2 border-emerald-400/20">
                <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-emerald-200">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
              </div>
            </div>

            {/* Nom et rôle */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-100">{member.name}</h3>
              <p className="text-sm text-emerald-200/70 mt-1">{member.role}</p>
            </div>

            {/* Bio */}
            <p className="text-sm text-slate-300 text-center leading-relaxed">{member.bio}</p>

            {/* LinkedIn link */}
            <div className="flex justify-center pt-2">
              <Link
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-emerald-200 hover:text-emerald-100 transition-colors"
              >
                <Linkedin className="h-4 w-4" />
                Voir le profil LinkedIn
              </Link>
            </div>
          </BentoCard>
        ))}
      </div>

      {/* Mission statement */}
      <BentoCard padding="lg" className="mt-8">
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <h3 className="text-xl font-semibold text-slate-100">Notre mission</h3>
          <p className="text-slate-300 leading-relaxed">
            Nous avons créé FinanceBro pour démocratiser l'accès aux meilleures pratiques d'entretiens en finance. 
            Notre plateforme combine intelligence artificielle de pointe, simulation vidéo immersive et feedback personnalisé 
            pour transformer chaque candidat en un expert de l'entretien finance.
          </p>
          <p className="text-sm text-slate-400">
            Rejoignez plus de 200 candidats qui ont déjà amélioré leurs performances grâce à FinanceBro.
          </p>
        </div>
      </BentoCard>
    </div>
  );
}
