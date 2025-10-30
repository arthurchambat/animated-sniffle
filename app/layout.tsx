import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "FinanceBro",
    template: "%s | FinanceBro"
  },
  description:
    "Préparez vos entretiens finance avec un coach IA temps réel : avatar vidéo, scoring avancé et feedback actionnable.",
  icons: {
    icon: "/favicon.ico"
  },
  openGraph: {
    title: "FinanceBro - Préparation aux entretiens finance",
    description:
      "Sessions mock interview immersives, avatar Beyond Presence et feedback IA temps réel pour la finance de marché, IB, M&A et private equity.",
    url: "https://financebro.app",
    siteName: "FinanceBro",
    locale: "fr_FR",
    type: "website"
  },
  metadataBase: new URL("https://financebro.app"),
  keywords: [
    "finance",
    "entretien",
    "mock interview",
    "coaching",
    "investment banking",
    "private equity",
    "trading"
  ]
};

export const viewport: Viewport = {
  themeColor: "#081827",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
