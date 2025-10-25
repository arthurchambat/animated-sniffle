import { Home, Video, User, Settings, Users, Mail, FileText, type LucideIcon } from "lucide-react";

export interface AppLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const APP_LINKS: AppLink[] = [
  {
    label: "Accueil",
    href: "/dashboard",
    icon: Home
  },
  {
    label: "Lancer une interview",
    href: "/interview/new",
    icon: Video
  },
  {
    label: "Mes feedbacks",
    href: "/feedbacks",
    icon: FileText
  },
  {
    label: "Mon compte",
    href: "/account",
    icon: User
  },
  {
    label: "Mes réglages",
    href: "/settings",
    icon: Settings
  },
  {
    label: "L'équipe",
    href: "/our-team",
    icon: Users
  },
  {
    label: "Support",
    href: "/support",
    icon: Mail
  }
];
